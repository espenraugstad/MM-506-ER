/***** HTML ELEMENTS *****/
const loginHeader = document.getElementById("login-header");
const loginBtn = document.getElementById("login-btn");
const loginUser = document.getElementById("login-user");
const loginPassword = document.getElementById("login-password");
const errorMessage = document.getElementById('error-message');

/***** GLOBAL VARIABLES *****/

let role = null;

window.onload = () => {
  errorMessage.classList.add("hidden");
  errorMessage.innerHTML = "";
  // Who is the login for?
  let urlParam = new URLSearchParams(document.location.search);
  role = urlParam.get("role");

  if (!role) {
    location.href = "index.html";
  } else {
    loginHeader.innerHTML = `Log in as ${role}`;
    if (role === "presenter") {
      loginUser.placeholder = "Testuser";
      loginPassword.placeholder = "123";
    } else {
      loginUser.placeholder = "Samstudent";
      loginPassword.placeholder = "456";
    }
  }
};

/***** EVENT LISTENERS *****/
loginBtn.addEventListener("click", async () => {
  console.log("Logging in");
  console.log(role);
  // Get the values
  let username = "";
  let password = "";
  if (role === "presenter") {
    username = loginUser.value === "" ? "Testuser" : loginUser.value;
    password = loginPassword.value === "" ? "123" : loginPassword.value;
  } else {
    username = loginUser.value === "" ? "Samstudent" : loginUser.value;
    password = loginPassword.value === "" ? "456" : loginPassword.value;
  }

  console.log(username);
  console.log(password);

  // Request login from server
  let result = await fetch("/login", {
    method: "post",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      password: password,
      role: role
    }),
  });

  let data = await result.json();
  console.log(data.username);
  if (data.username) {
    localStorage.setItem("user", data.username);
    localStorage.setItem("userId", data.user_id);

    // Create a "sillytoken"
    let sillytoken = window.btoa(`${username}:${password}:${role}`);
    localStorage.setItem("sillytoken", sillytoken);

    if (role === "presenter") {
      errorMessage.classList.add("hidden");
      errorMessage.innerHTML = "";
      location.href = "presenter-dashboard.html";
    }
    else if (role=== "student"){
      errorMessage.classList.add("hidden");
      errorMessage.innerHTML = "";
      location.href = "student-dashboard.html";
    }
  } else {
    console.log("User not found");
    errorMessage.classList.remove("hidden");
    errorMessage.innerHTML = "Incorrect username and/or password.";
  }
});
