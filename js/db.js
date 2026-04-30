import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { db } from "./firebase-config.js";

const medicinesCollection = collection(db, "medicines");

/** Firebase Web may use `exists` as a boolean property or `exists()` as a method. */
function snapshotDocExists(snapshot) {
  if (!snapshot) return false;
  if (typeof snapshot.exists === "function") return snapshot.exists();
  if (typeof snapshot.exists === "boolean") return snapshot.exists;
  return snapshot.data() !== undefined;
}

/**
 * After login: ensure `users/{uid}` exists (same as getDoc → setDoc if missing).
 * Default role "user". Promote to "admin" only in Firebase Console.
 * Returns role for UI (equivalent to setRole in React).
 */
export async function ensureUserProfile(uid, email) {
  const userRef = doc(db, "users", uid);
  const userDoc = await getDoc(userRef);

  if (!snapshotDocExists(userDoc)) {
    await setDoc(userRef, {
      uid,
      email: email || "",
      role: "user"
    });
    return "user";
  }

  const data = userDoc.data();
  const rawRole = data?.role;
  console.log("[ensureUserProfile] uid:", uid, "raw role from Firestore:", rawRole);

  return typeof rawRole === "string" && rawRole.trim().toLowerCase() === "admin"
    ? "admin"
    : "user";
}

// Add a medicine listing document in Firestore.
export async function addMedicine(data) {
  const payload = {
    medicineName: data.medicineName,
    medicineNameLower: data.medicineName.toLowerCase(),
    storeName: data.storeName,
    location: data.location,
    quantity: Number(data.quantity),
    contact: data.contact,
    imageUrl: "",
    createdAt: serverTimestamp()
  };
  console.log("[addMedicine] saving payload:", payload);

  const docRef = await addDoc(medicinesCollection, payload);
  return docRef.id;
}

// Search medicine by exact lower-cased name.
export async function searchMedicines(searchTerm) {
  const normalized = searchTerm.trim().toLowerCase();
  if (!normalized) return [];
  console.log("[searchMedicines] normalized search:", normalized);

  const q = query(
    medicinesCollection,
    where("medicineNameLower", "==", normalized)
  );

  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
