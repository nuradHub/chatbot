import { ToastContainer } from "react-toastify";
import { Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
import { useContext, useEffect, useState, Suspense } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig/firebaseConfig";
import { AppContext } from "./context/CreateContext";
import React from "react";
import LazyLoadingImage from "./assets/lazy-loading.gif";
import "./App.css";
/*
import HomePage from "./pages/HomePage";
import SignUp from "./component/SignUp";
import { Chats } from "./pages/Chats";
*/
const HomePage = React.lazy(() => import("./pages/HomePage"));
const SignUp = React.lazy(() => import("./component/SignUp"));
const Chats = React.lazy(() => import("./pages/Chats"));

function App() {
  
  const navigate = useNavigate();
  const { HandleUserData } = useContext(AppContext);
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        HandleUserData(user.uid);
      } else {
        // only redirect if they are not on the home page
        if (window.location.pathname !== "/") {
          navigate("/signup");
        }
      }
    });
  }, []);

  return (
    <>
      <ToastContainer />
      <Suspense
        fallback={
          <div className="lazy-container">
            <img src={LazyLoadingImage} alt="loading..." />
          </div>
        }
      >
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/chats"
            element={
              <Chats
                chatMessages={chatMessages}
                setChatMessages={setChatMessages}
              />
            }
          />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
