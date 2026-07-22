import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyD_BRG0_62qDl-ZA7gHv_1xT-py7s8J-og",
  authDomain: "jl-newreleases.firebaseapp.com",
  projectId: "jl-newreleases",
  storageBucket: "jl-newreleases.firebasestorage.app",
  messagingSenderId: "921316307718",
  appId: "1:921316307718:web:61890865ffdd74a752a487"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
