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
  }
};

/***** EVENT LISTENERS *****/
loginBtn.addEventListener("click", async () => {
  console.log("Logging in");
  console.log(role);
  // Get the values
  let username = loginUser.value === "" ? "Testuser" : loginUser.value;
  let password = loginPassword.value === "" ? "123" : loginPassword.value;
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
    }),
  });

  let data = await result.json();
  console.log(data.username);
  if (data.username) {
    localStorage.setItem("user", data.username);
    localStorage.setItem("userId",  data.user_id);

    if (role === "presenter") {
      errorMessage.classList.add("hidden");
      errorMessage.innerHTML = "";
      location.href = "presenter-dashboard.html";
    }
  } else {
    console.log("User not found");
    errorMessage.classList.remove("hidden");
    errorMessage.innerHTML = "Incorrect username and/or password.";
  }
});
