// firebase.js
// Initialize Firebase and Firestore via CDN ES modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import {
  getFirestore,
  addDoc,
  collection,
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// Your Firebase Web configuration (from the Config snippet in Console)
const firebaseConfig = {
  apiKey: "AIzaSyB87-rBZOibNVD5Y_2FPIQWf98A7m-X09U",
  authDomain: "product-configurator-ff689.firebaseapp.com",
  projectId: "product-configurator-ff689",
  storageBucket: "product-configurator-ff689.appspot.com",  // ← corrected here
  messagingSenderId: "513805449458",
  appId: "1:513805449458:web:834ce115ab7971ec2b786b"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

/**
 * Persist a new quote. Returns the Firestore document ID.
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
 * Load a quote by its Firestore ID.
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
