import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { auth } from "./firebase-config.js";

const authForm = document.getElementById("authForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const authSubmitBtn = document.getElementById("authSubmitBtn");
const authLoading = document.getElementById("authLoading");
const authMessage = document.getElementById("authMessage");
const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");

let isSignupMode = false;

function setMessage(text, type = "") {
  authMessage.textContent = text;
  authMessage.className = `message ${type}`.trim();
}

function setLoading(isLoading) {
  authLoading.classList.toggle("hidden", !isLoading);
  authSubmitBtn.disabled = isLoading;
}

function validateInputs(email, password) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    throw new Error("Please enter a valid email address.");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }
}

function switchMode(signupMode) {
  isSignupMode = signupMode;
  loginTab.classList.toggle("active", !signupMode);
  signupTab.classList.toggle("active", signupMode);
  authSubmitBtn.textContent = signupMode ? "Create Account" : "Login";
  setMessage("");
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  setMessage("");

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  try {
    validateInputs(email, password);
    setLoading(true);

    if (isSignupMode) {
      await createUserWithEmailAndPassword(auth, email, password);
      setMessage("Account created. Redirecting...", "success");
    } else {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage("Login successful. Redirecting...", "success");
    }

    window.location.href = "./dashboard.html";
  } catch (error) {
    setMessage(error.message || "Authentication failed.", "error");
  } finally {
    setLoading(false);
  }
}

loginTab.addEventListener("click", () => switchMode(false));
signupTab.addEventListener("click", () => switchMode(true));
authForm.addEventListener("submit", handleAuthSubmit);

// If user is already logged in, go directly to dashboard.
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "./dashboard.html";
  }
});
