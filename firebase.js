// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import {
  getFirestore,
  addDoc,
  collection,
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// 1) Paste your Firebase Web config here
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app",
  // ...etc
};

// 2) Initialize Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

/**
 * Persist a new quote. Returns the Firestore doc ID.
 */
export async function saveQuote(config) {
  const ref = await addDoc(collection(db, "quotes"), {
    created:  new Date().toISOString(),
    payload:  config,
    accepted: false,
    paid:     false
  });
  return ref.id;
}

/**
 * Load a quote by Firestore ID.
 */
export async function loadQuote(id) {
  const snap = await getDoc(doc(db, "quotes", id));
  if (!snap.exists()) throw new Error("Quote not found");
  return snap.data().payload;
}

/**
 * Mark a quote as accepted.
 */
export async function acceptQuote(id) {
  await updateDoc(doc(db, "quotes", id), { accepted: true });
}
