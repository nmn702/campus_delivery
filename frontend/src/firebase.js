import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyDhuHJOgFbM5OvuamiRMY1Yb35zsUpSqbw",
  authDomain: "campus-delivery-b22d6.firebaseapp.com",
  projectId:"campus-delivery-b22d6",
  storageBucket: "campus-delivery-b22d6.appspot.com",
  messagingSenderId: "790768890047",
  appId: "1:790768890047:web:d471aa24b17a97530b960a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
