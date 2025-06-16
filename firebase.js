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

const firebaseConfig = {
  apiKey: "AIzaSyB87-rBZOibNVD5Y_2FPIQWf98A7m-X09U",
  authDomain: "product-configurator-ff689.firebaseapp.com",
  projectId: "product-configurator-ff689",
  storageBucket: "product-configurator-ff689.firebasestorage.app",
  messagingSenderId: "513805449458",
  appId: "1:513805449458:web:834ce115ab7971ec2b786b"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

export async function saveQuote(config) {
  const ref = await addDoc(collection(db, "quotes"), {
    created:  new Date().toISOString(),
    payload:  config,
    accepted: false,
    paid:     false
  });
  return ref.id;
}

export async function loadQuote(id) {
  const snap = await getDoc(doc(db, "quotes", id));
  if (!snap.exists()) throw new Error("Quote not found");
  return snap.data().payload;
}

export async function acceptQuote(id) {
  await updateDoc(doc(db, "quotes", id), { accepted: true });
}
