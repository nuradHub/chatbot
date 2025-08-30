import { initializeApp } from "firebase/app";
import { 
  createUserWithEmailAndPassword, 
  getAuth, 
  GoogleAuthProvider, 
  sendPasswordResetEmail, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signInWithRedirect,   // 👈 added
  getRedirectResult,    // 👈 added
  signOut
} from 'firebase/auth'
import { doc, getFirestore, setDoc } from 'firebase/firestore'
import { toast } from "react-toastify";

const firebaseConfig = {
  apiKey: "AIzaSyD61YXg8GLz4gGTt40m_B9dYQNTJuQ9Y3Y",
  authDomain: (() => {
    const host = window.location.hostname;

    if (host === "localhost") {
      return "localhost";
    }

    // list of known custom domains you already added in Firebase Auth
    const allowedDomains = [
      "chatbot-project-ea988.firebaseapp.com",
      "chatbot-project-ea988.web.app",
      "chatbot-production-3102.up.railway.app",
      // you can add more later, e.g.:
      // "yourcustomdomain.com",
      // "yourproject.vercel.app",
    ];

    // return the one that matches current host
    const match = allowedDomains.find(d => host.includes(d));
    return match || "chatbot-project-ea988.firebaseapp.com"; // fallback
  })(),
  projectId: "chatbot-project-ea988",
  storageBucket: "chatbot-project-ea988.firebasestorage.app",
  messagingSenderId: "699993215901",
  appId: "1:699993215901:web:2f6dca0dadea83ac791574",
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const db = getFirestore(app)

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account"
});

export const HandleSignup = async (email, password)=> {
  try{
    const response = await createUserWithEmailAndPassword(auth, email, password)
    const userSnap = response.user;

    await setDoc(doc(db, 'users', userSnap.uid), {
      id: userSnap.uid,
      name: '',
      email: email,
      createdAt: new Date(),
      bio: 'Hey there, am using NuraChat'
    })
    return userSnap;
  }catch (error){
    console.error(error);
    throw error;
  }
}

export const HandleSignin = async (email, password)=> {
  try{
    const userSnap = await signInWithEmailAndPassword(auth, email, password);
    return userSnap.user
  }catch (error) {
    console.error(error);
    throw error;
  }
}

// ✅ Updated Google Signin with redirect fallback
export const HandleGoogleSignin = async ()=> {
  try {
    let response;
    if (window.innerWidth < 768) {
      // Mobile devices → use redirect (popup is often blocked)
      await signInWithRedirect(auth, googleProvider);
      response = await getRedirectResult(auth);
    } else {
      // Desktop → use popup
      response = await signInWithPopup(auth, googleProvider);
    }

    if (!response) return; // if redirect hasn’t returned yet

    const userSnap = response.user;
    await setDoc(doc(db, 'users', userSnap.uid), {
      id: userSnap.uid,
      name: userSnap.displayName,
      email: userSnap.email,
      createdAt: new Date(),
      bio: 'Hey there, am using NuraChat',
      avater: userSnap.photoURL
    })
    return userSnap;
  }catch (error) {
    console.error(error);
    throw error;
  }
}

export const HandleSignOut = async ()=> {
  try{
    await signOut(auth);
  }catch(error){
    console.error(error);
    throw error;
  }
}

export const HandleSendResetCode = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email)
    toast.success('Password reset email sent')
  } catch (error) {
    console.log(error);
    throw error;
  }
};
