import auth from "./auth/auth.js";

const togglePassword = document.getElementById("togglePassword");

const showOrHidePassword = () => {
  const password = document.getElementById("passwordInput");
  if (password.type === "password") {
    password.type = "text";
    togglePassword.textContent = "🔓";
  } else {
    password.type = "password";
    togglePassword.textContent = "🔒";
  }
};

togglePassword.addEventListener("click", showOrHidePassword);

document.getElementById("loginBtn").addEventListener("click", auth.login);

document.getElementById("passwordInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") auth.login();
});
