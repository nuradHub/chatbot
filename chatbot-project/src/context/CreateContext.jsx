import { createContext, useState } from "react";
import { toast } from "react-toastify";
import {
  HandleSignin,
  HandleSignup,
  HandleGoogleSignin,
  db,
} from "../firebaseConfig/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const navigate = useNavigate();

  const toastUpdate = (id, message, type, autoClose = 3000) => {
    toast.update(id, {
      render: message,
      type: type,
      isLoading: false,
      autoClose,
      closeOnClick: true
    });
  };

  const [userData, setUserData] = useState(null);
  const [googleData, setGoogleData] = useState(null);
  const [storedMessages, setStoredMessages] = useState(null)
  const [regState, setRegState] = useState("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [viewPassword, setViewPassword] = useState(false);
  const [userId, setUserId] = useState("");

  const HandleSubmit = async (event) => {
    event.preventDefault();

    if (regState === "signup") {
      const id = toast.loading("Loading...");
      try {
        const user = await HandleSignup(email, password);
        if (!user) return;
        toastUpdate(id, "Signup successful", "success");
        setRegState("signin");
        setEmail("");
        setPassword("");
      } catch (error) {
        console.log(error);
        toastUpdate(
          id,
          error.code?.split("/")[1]?.split("-")?.join(" "),
          "error"
        );
      }
    } else if (regState === "signin") {
      const id = toast.loading("Loading...");
      try {
        const user = await HandleSignin(email, password);
        if (!user) return;
        toastUpdate(id, "Signin successful", "success");
        navigate("chats");
        setEmail("");
        setPassword("");
      } catch (error) {
        console.log(error);
        toastUpdate(
          id,
          error.code?.split("/")[1]?.split("-")?.join(" "),
          "error"
        );
      }
    }
  };

  const GoogleSignin = async () => {
    try {
      const user = await HandleGoogleSignin();
      if (!user) return;
      toast.success("Sign in successfully");
      navigate("chats");
    } catch (error) {
      console.error(error);
      toast.error(error.code?.split("/")[1]?.split("-")?.join(" "));
    }
  };

  const HandleUserData = async (id) => {
    setUserId(id);
    const userRef = doc(db, "users", id);
    try {
      const userDoc = await getDoc(userRef);
      const userSnap = userDoc.data();
      setUserData(userSnap);
    } catch (error) {
      console.log(error);
      toast.error(error.code?.split("/")[1]?.split("-")?.join(" "));
    }
  };

  const value = {
    userData,
    setUserData,
    googleData,
    setGoogleData,
    regState,
    setRegState,
    email,
    setEmail,
    password,
    setPassword,
    viewPassword,
    setViewPassword,
    HandleSubmit,
    GoogleSignin,
    HandleUserData,
    userId,
    setUserId,
    toastUpdate,
    storedMessages, setStoredMessages
  };
  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
