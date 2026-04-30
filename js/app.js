import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import {
  getToken,
  onMessage
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-messaging.js";
import { auth, setupMessaging } from "./firebase-config.js";
import {
  addMedicine,
  ensureUserProfile,
  searchMedicines
} from "./db.js";

const userEmail = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const searchLoading = document.getElementById("searchLoading");
const searchMessage = document.getElementById("searchMessage");
const resultsContainer = document.getElementById("resultsContainer");

const medicineForm = document.getElementById("medicineForm");
const medicineNameInput = document.getElementById("medicineName");
const storeNameInput = document.getElementById("storeName");
const locationInput = document.getElementById("location");
const quantityInput = document.getElementById("quantity");
const contactInput = document.getElementById("contact");
const addLoading = document.getElementById("addLoading");
const addMessage = document.getElementById("addMessage");
const addMedicineFormSection = document.getElementById("addMedicineFormSection");
const shopOwnerOnlyNotice = document.getElementById("shopOwnerOnlyNotice");

let currentUser = null;
/** @type {'admin' | 'user' | null} — mirrors window.currentUserRole */
let userRole = null;
let isSearching = false;
let isAddingMedicine = false;

/** Increments on each auth callback so stale async completions cannot overwrite UI. */
let authUiGeneration = 0;

function applyMedicineSectionForRole(role) {
  if (!addMedicineFormSection || !shopOwnerOnlyNotice) return;

  const isAdmin = role === "admin";
  addMedicineFormSection.classList.toggle("hidden", !isAdmin);
  shopOwnerOnlyNotice.classList.toggle("hidden", isAdmin);
}

function setMessage(target, text, type = "") {
  target.textContent = text;
  target.className = `message ${type}`.trim();
}

function setLoading(target, isLoading) {
  target.classList.toggle("hidden", !isLoading);
}

function renderResults(items) {
  resultsContainer.innerHTML = "";

  if (items.length === 0) {
    resultsContainer.innerHTML = "<p>Medicine not available</p>";
    return;
  }

  for (const medicine of items) {
    const card = document.createElement("article");
    card.className = "result-card";
    card.innerHTML = `
      <h3>${medicine.medicineName}</h3>
      <p><strong>Store:</strong> ${medicine.storeName}</p>
      <p><strong>Location:</strong> ${medicine.location}</p>
      <p><strong>Quantity:</strong> ${medicine.quantity}</p>
      <p><strong>Contact:</strong> ${medicine.contact}</p>
    `;
    resultsContainer.appendChild(card);
  }
}

async function handleSearch(event) {
  event.preventDefault();
  if (isSearching) return;
  setMessage(searchMessage, "");
  resultsContainer.innerHTML = "";

  const term = searchInput.value.trim();
  if (!term) {
    setMessage(searchMessage, "Enter a medicine name to search.", "error");
    return;
  }

  try {
    isSearching = true;
    setLoading(searchLoading, true);
    const medicines = await searchMedicines(term);
    renderResults(medicines);
    if (medicines.length === 0) {
      setMessage(searchMessage, "Medicine not available", "error");
      return;
    }
    setMessage(searchMessage, `Found ${medicines.length} result(s).`, "success");
  } catch (error) {
    setMessage(searchMessage, error.message || "Failed to fetch medicines.", "error");
  } finally {
    isSearching = false;
    setLoading(searchLoading, false);
  }
}

function validateMedicineForm() {
  if (!medicineNameInput.value.trim()) throw new Error("Medicine name is required.");
  if (!storeNameInput.value.trim()) throw new Error("Store name is required.");
  if (!locationInput.value.trim()) throw new Error("Location is required.");
  if (!contactInput.value.trim()) throw new Error("Contact number is required.");

  const qty = Number(quantityInput.value);
  if (Number.isNaN(qty) || qty < 0) throw new Error("Quantity must be 0 or more.");
}

function mockLocalNotification(medicineName) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("New medicine added", {
      body: `${medicineName} has been added to availability list.`
    });
  }
}

async function handleAddMedicine(event) {
  event.preventDefault();
  if (isAddingMedicine) return;
  setMessage(addMessage, "");

  if (!currentUser) {
    setMessage(addMessage, "Please log in again.", "error");
    return;
  }

  const effectiveRole = window.currentUserRole ?? userRole;
  if (effectiveRole !== "admin") {
    setMessage(addMessage, "Only medical shop owners can add medicines.", "error");
    return;
  }

  try {
    isAddingMedicine = true;
    validateMedicineForm();
    setLoading(addLoading, true);

    const payload = {
      medicineName: medicineNameInput.value.trim(),
      storeName: storeNameInput.value.trim(),
      location: locationInput.value.trim(),
      quantity: Number(quantityInput.value),
      contact: contactInput.value.trim()
    };

    await addMedicine(payload);
    medicineForm.reset();
    setMessage(addMessage, "Medicine added successfully.", "success");

    // Mock notification trigger in browser after successful add.
    mockLocalNotification(payload.medicineName);
  } catch (error) {
    setMessage(addMessage, error.message || "Failed to add medicine.", "error");
  } finally {
    isAddingMedicine = false;
    setLoading(addLoading, false);
  }
}

async function requestBrowserNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    try {
      await Notification.requestPermission();
    } catch (error) {
      console.warn("Notification permission request failed:", error.message);
    }
  }
}

async function initMessaging() {
  try {
    const messaging = await setupMessaging();
    if (!messaging) return;

    const registration = await navigator.serviceWorker.register("./firebase-messaging-sw.js");

    // Replace with your Web Push certificate key from Firebase console.
    const token = await getToken(messaging, {
      vapidKey: "YOUR_PUBLIC_VAPID_KEY",
      serviceWorkerRegistration: registration
    });

    if (token) {
      console.log("FCM token:", token);
    }

    // Listen for foreground notifications from Firebase Cloud Messaging.
    onMessage(messaging, (payload) => {
      console.log("Foreground message:", payload);
      const title = payload?.notification?.title || "Medicine Update";
      const body = payload?.notification?.body || "New stock update received.";
      setMessage(searchMessage, `${title}: ${body}`, "success");
    });
  } catch (error) {
    console.warn("FCM setup skipped:", error.message);
  }
}

logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "./index.html";
  } catch (error) {
    setMessage(addMessage, error.message || "Failed to logout.", "error");
  }
});

searchForm.addEventListener("submit", handleSearch);
medicineForm.addEventListener("submit", handleAddMedicine);

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.currentUserRole = null;
    userRole = null;
    window.location.href = "./index.html";
    return;
  }

  const gen = ++authUiGeneration;
  currentUser = user;
  userEmail.textContent = user.email || "Logged in";

  let role = "user";
  try {
    // Ensures Firestore security rules see a valid auth token before reading `users/{uid}`.
    await user.getIdToken();
    role = await ensureUserProfile(user.uid, user.email || "");
    console.log("ROLE AFTER LOGIN:", role);
  } catch (err) {
    console.warn("[auth] failed to load user profile:", err.message);
    role = "user";
  }

  if (gen !== authUiGeneration) return;

  window.currentUserRole =
    typeof role === "string" && role.trim().toLowerCase() === "admin" ? "admin" : "user";
  userRole = window.currentUserRole;
  console.log("FINAL ROLE USED IN UI:", window.currentUserRole);

  applyMedicineSectionForRole(window.currentUserRole);

  await requestBrowserNotificationPermission();
  await initMessaging();
});
