// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ✅ Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAbJ96lstjJG13h_Vvrv8O98agNnIlysq0",
  authDomain: "to-doc-chama.firebaseapp.com",
  projectId: "to-doc-chama",
  storageBucket: "to-doc-chama.firebasestorage.app",
  messagingSenderId: "777431365417",
  appId: "1:777431365417:web:e725886e0d3a4262e7e938"
};

// ✅ Initialize Firebase with your project
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const tasksRef = collection(db, "tasks");
const tasksQuery = query(tasksRef, orderBy("createdAt", "asc")); // oldest first

// DOM Elements
const addBtn = document.getElementById("addTask");
const taskList = document.getElementById("taskList");
const taskNameInput = document.getElementById("taskName");
const taskTypeSelect = document.getElementById("taskType");

// Add Task
addBtn.onclick = async () => {
  const name = taskNameInput.value.trim();
  const type = taskTypeSelect.value;
  if (!name) return alert("Enter a task name");

  await addDoc(tasksRef, {
    name,
    type,
    createdAt: Date.now()
  });

  taskNameInput.value = "";
};

// Render a single task
function renderTask(docSnapshot) {
  const data = docSnapshot.data();
  const now = Date.now();
  const diffMs = now - data.createdAt;

  let timerText;
  if (data.type === "Certificat") {
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    timerText = `${days}d`;
  } else {
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    timerText = `${hours}h`;
  }

  const taskDiv = document.createElement("div");
  taskDiv.className = "task";

  // Color coding for non-Certificat tasks
  if (data.type !== "Certificat") {
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    if (hours >= 120) taskDiv.classList.add("red");
    else if (hours >= 50) taskDiv.classList.add("yellow");
  }

  const info = document.createElement("div");
  info.className = "task-info";
  info.innerHTML = `<strong>${data.name}</strong> — <span class="task-timer">${timerText}</span>`;

  // Update dropdown
  const typeSelect = document.createElement("select");
  const options = [
    "Acouplement", "To Sereniter", "From Sereniter", "To Sereniter Bébé",
    "From Sereniter Bébé", "To Water Bébé", "To Énergie", "XP",
    "Certificat", "Problem"
  ];
  options.forEach(opt => {
    const option = document.createElement("option");
    option.value = opt;
    option.textContent = opt;
    if (opt === data.type) option.selected = true;
    typeSelect.appendChild(option);
  });

  typeSelect.onchange = async () => {
    await updateDoc(doc(tasksRef, docSnapshot.id), {
      type: typeSelect.value
    });
  };

  // Delete button
  const delBtn = document.createElement("button");
  delBtn.textContent = "Delete";
  delBtn.onclick = async () => {
    await deleteDoc(doc(tasksRef, docSnapshot.id));
  };

  taskDiv.appendChild(info);
  taskDiv.appendChild(typeSelect);
  taskDiv.appendChild(delBtn);

  taskList.appendChild(taskDiv);
}

// Real-time listener to tasks
onSnapshot(tasksQuery, (snapshot) => {
  taskList.innerHTML = "";
  snapshot.forEach(renderTask);
});
