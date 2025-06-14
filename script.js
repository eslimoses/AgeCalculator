// Firebase Configuration (use Firebase v8 syntax for external script usage)
var firebaseConfig = {
  apiKey: "AIzaSyBVsr6KNOdkEHkZdWHroBll1dxCoTNLa70",
  authDomain: "agecalculatorapp-e836f.firebaseapp.com",
  projectId: "agecalculatorapp-e836f",
  storageBucket: "agecalculatorapp-e836f.appspot.com",
  messagingSenderId: "459824171764",
  appId: "1:459824171764:web:cdc51a05fa8bcaf1b1aca1",
  measurementId: "G-NTQQ4K2GPH"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var provider = new firebase.auth.GoogleAuthProvider();

// Handle Google Sign In
function signIn() {
  firebase.auth().signInWithPopup(provider)
    .then(result => {
      const user = result.user;
      document.getElementById('login-info').innerHTML = `
        <p>✅ Hello, ${user.displayName}</p>
        <button onclick="signOut()">Sign Out</button>
      `;
      document.getElementById('age-form').style.display = 'block';
      loadMembers();
    })
    .catch(error => {
      console.error("Login Error:", error);
    });
}

// Sign Out
function signOut() {
  firebase.auth().signOut().then(() => {
    document.getElementById('login-info').innerHTML = `<button onclick="signIn()">Sign in with Google</button>`;
    document.getElementById('age-form').style.display = 'none';
  });
}

// Show correct view based on auth state
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    document.getElementById('login-info').innerHTML = `
      <p>✅ Hello, ${user.displayName}</p>
      <button onclick="signOut()">Sign Out</button>
    `;
    document.getElementById('age-form').style.display = 'block';
    loadMembers();
  } else {
    document.getElementById('login-info').innerHTML = `<button onclick="signIn()">Sign in with Google</button>`;
    document.getElementById('age-form').style.display = 'none';
  }
});

// Calculate age from DOB
function calculateAge(dob) {
  const diff = Date.now() - dob.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

// Add new member
function addMember() {
  const name = document.getElementById("name").value.trim();
  const dobValue = document.getElementById("dob").value;

  if (!name || !dobValue) return alert("Please enter both name and date of birth.");

  const age = calculateAge(new Date(dobValue));
  const members = JSON.parse(localStorage.getItem("members") || "[]");

  members.push({ name, dob: dobValue, age });
  localStorage.setItem("members", JSON.stringify(members));

  document.getElementById("name").value = "";
  document.getElementById("dob").value = "";
  loadMembers();
}

// Load members from localStorage
function loadMembers() {
  const list = document.getElementById("member-list");
  list.innerHTML = "";

  const members = JSON.parse(localStorage.getItem("members") || "[]");
  if (members.length === 0) {
    list.innerHTML = "<p>No members added yet.</p>";
    return;
  }

  members.sort((a, b) => b.age - a.age);
  const oldest = members[0];
  const youngest = members[members.length - 1];

  members.forEach((member, index) => {
    const div = document.createElement("div");
    div.className = "member";
    let label = "";
    if (member.name === oldest.name) label = " 🧓 Oldest";
    if (member.name === youngest.name) label = " 👶 Youngest";

    div.innerHTML = `
      <strong>${member.name}</strong> - ${member.age} years${label}
      <button class="del-btn" onclick="deleteMember(${index})">🗑️</button>
    `;
    list.appendChild(div);
  });

  const resetBtn = document.createElement("button");
  resetBtn.textContent = "♻️ Clear All Members";
  resetBtn.onclick = clearAllMembers;
  resetBtn.className = "clear-btn";
  list.appendChild(resetBtn);
}

// Delete one member
function deleteMember(index) {
  const members = JSON.parse(localStorage.getItem("members") || "[]");
  members.splice(index, 1);
  localStorage.setItem("members", JSON.stringify(members));
  loadMembers();
}

// Clear all members
function clearAllMembers() {
  if (confirm("Are you sure you want to clear all members?")) {
    localStorage.removeItem("members");
    loadMembers();
  }
}
