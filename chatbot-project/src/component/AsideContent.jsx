import { useState } from "react";
import chatbotImage1 from "../assets/chatbot-1.png";
import UserProfilePic from "../assets/avater.png";
import HistoryIcon from "../assets/icon/history-light.png";
import "./AsideContent.css";
import { AppContext } from "../context/CreateContext";
import { useContext } from "react";
import { db, HandleSignOut } from "../firebaseConfig/firebaseConfig";
import { toast } from "react-toastify";

import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";

export const AsideContent = ({ asideView, chatId, userId, setChatMessages }) => {
  const [viewHistory, setViewHistory] = useState(false);

  const { userData, storedMessages, setStoredMessages } = useContext(AppContext);

  const SignOut = async () => {
    try {
      await HandleSignOut();
      toast.success("Signout Successful");
      setChatMessages([])
      setStoredMessages([])
    } catch (error) {
      console.log(error);
      toast.error(error.code?.split("/")[1]?.split("-")?.join(" "));
    }
  };

  const ViewAllHistory = () => {
    setViewHistory(!viewHistory);
  };

  const ClearHistory = async () => {
    const historyRef = collection(
      db,
      "users",
      userId,
      "chats",
      chatId,
      "messages"
    );
    try {
      const docSnap = await getDocs(historyRef);
      const deleteHistory = docSnap.docs.map((messageId) =>
        deleteDoc(
          doc(db, "users", userId, "chats", chatId, "messages", messageId.id)
        )
      );
      await Promise.all(deleteHistory);
    } catch (error) {
      console.log(error);
      toast.error(error.code);
    }
  };
  return (
    <div className={`aside-bar-container ${asideView && "aside-bar"}`}>
      <div className="aside-header">
        <img src={chatbotImage1} className="chatbot-icon" alt="" />
        <div className="aside-header-details">
          <h3>NuraChat</h3>
          <p>by nuradHub</p>
        </div>
      </div>
      <div className="history-container">
        <div className="history-contents">
          <div className="history-text">
            <img src={HistoryIcon} alt="" />
            <h5>History</h5>
          </div>
          <button onClick={ClearHistory}>Clear History</button>
        </div>
        <div className="history-details">
          {!viewHistory ? (
            <div>
              <div className="question-container">
                {storedMessages?.[0]?.sender === "user" && (
                  <h4>{storedMessages[0]?.text }</h4>
                )}
                {storedMessages?.[1]?.sender === "robot" &&
                  storedMessages[1]?.status === "done" && (
                    <p>{storedMessages[1]?.text}</p>
                  )}

                <hr />
              </div>
            </div>
          ) : (
            <div className="question-container">
              {storedMessages &&
                [...storedMessages]?.sort((a,b)=> b.createdAt - a.createdAt)?.map((historyItem, index) => {
                  return (
                    <div key={index}>
                      {historyItem.sender === "user" && (
                        <h4>User:{historyItem?.text}</h4>
                      )}
                      {historyItem.sender === "robot" &&
                        historyItem.status === "done" && (
                          <p> <strong>NuraChat:</strong> {historyItem?.text}</p>
                        )}
                      <hr />
                    </div>
                  );
                })}
            </div>
          )}

          <div className="view-all-history" onClick={ViewAllHistory}>
            {!viewHistory ? "View More History" : "View Less History "}
          </div>
        </div>

        <div className="users-container">
          <div className="signout-container">
            <h3>NuraChat User</h3>
            <button onClick={SignOut}>Sign out</button>
          </div>
          <hr />
          <div className="user-contents">
            <img
              src={userData?.avater ? userData?.avater : UserProfilePic}
              className="user-profile-pic"
              alt=""
            />
            <div className="user-details">
              <h3>{userData?.name ? userData?.name : "member"}</h3>
              <p>{userData?.bio}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
