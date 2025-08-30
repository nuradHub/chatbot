import { useContext, useEffect } from "react";
import axios from "axios";
import { AsideContent } from "../component/AsideContent";
import SendIcon from "../assets/icon/send-icon.png";
import OptionIcon from "../assets/icon/triple-dot.png";
import UserProfilePic from "../assets/avater.png";
import LoadingIcon from "../assets/loading.gif";
import chatbotImage1 from "../assets/chatbot-1.png";
import eyeIcon from "../assets/eye-icon.png";
import "./Chats.css";
import { useState } from "react";
import { useRef } from "react";
import { toast } from "react-toastify";
import { AppContext } from "../context/CreateContext";
import dayjs from "dayjs";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig/firebaseConfig";

const Chats = ({ chatMessages, setChatMessages }) => {
  const [asideView, setAsideView] = useState(false);
  const [changeMode, setChangeMode] = useState(false);
  const [chatId, setChatId] = useState("");
  const [inputText, setInputText] = useState("");
  const divElement = useRef(null);

  const { userData, userId, setStoredMessages } = useContext(AppContext);

  const viteEnv = import.meta.env.VITE_API_URL
  console.log(viteEnv)

  const apiCall = axios.create({
    baseURL: viteEnv ? viteEnv : 'http://localhost:3000/api'
  });

  const ViewAsideContent = () => {
    setAsideView(!asideView);
  };
  const DivElement = () => {
    setAsideView(false);
  };
  const ChangeMode = () => {
    setChangeMode(!changeMode);
  };

  const GetInputText = (event) => {
    setInputText(event.target.value);
  };

  const SendMessage = async () => {
    if (inputText !== "") {
      const userTempId = crypto.randomUUID();
      const userMessage = {
        sender: "user",
        text: inputText,
        id: userTempId,
        status: "done",
        createdAt: new Date().getTime(),
      };

      const robotTempId = crypto.randomUUID();
      const robotMessage = {
        sender: "robot",
        text: "",
        id: robotTempId,
        status: "loading",
        createdAt: new Date().getTime(),
      };

      const userMessageRef = [...chatMessages, userMessage, robotMessage];
      setChatMessages(userMessageRef);

      const chatRef = collection(db, "users", userId, "chats");
      let chatDocRef;

      if (!chatId) {
        chatDocRef = await addDoc(chatRef, {
          createdAt: new Date(),
        });
        setChatId(chatDocRef?.id);
        localStorage.setItem(`chatId${userId}`, JSON.stringify(chatDocRef.id));
      } else {
        chatDocRef = doc(db, "users", userId, "chats", chatId);
      }

      const messageRef = collection(
        db,
        "users",
        userId,
        "chats",
        chatDocRef?.id,
        "messages"
      );

      await addDoc(messageRef, {
        sender: "user",
        text: inputText,
        status: "done",
        createdAt: new Date().getTime(),
      });

      const robotRef = await addDoc(messageRef, {
        sender: "robot",
        text: "",
        status: "loading",
        createdAt: new Date().getTime(),
      });

      const updatedChatMessagesRef = userMessageRef.map((messageItem) =>
        messageItem.id === robotTempId
          ? { ...messageItem, id: robotRef?.id }
          : messageItem
      );

      setChatMessages(updatedChatMessagesRef);
      const inputCopy = inputText;
      setInputText("");

      try {
        const response = await apiCall.post(`/chat`, {
          userId: userId,
          message: inputCopy,
        });

        const responseSnap = response?.data?.response;

        const updatedChatMessages = updatedChatMessagesRef.map((messageItem) =>
          messageItem.id === robotRef?.id
            ? { ...messageItem, text: responseSnap, status: "done", createdAt: new Date().getTime(), }
            : messageItem
        );

        setChatMessages(updatedChatMessages);

        await updateDoc(robotRef, {
          text: responseSnap,
          status: "done",
        });
      } catch (error) {
        console.log(error);
        toast.error(error.code?.split("/")[1]?.split("-")?.join(" "));
      }
    }
  };

  const EnterToSendMessage = (event) => {
    if (event.key === "Enter" && inputText !== "") {
      SendMessage();
      setInputText("");
    }
  };

  useEffect(() => {
    if (chatId) {
      const userRef = collection(
        db,
        "users",
        userId,
        "chats",
        chatId,
        "messages"
      );
      const q = query(userRef, orderBy("createdAt", "asc"));

      const unSubscribe = onSnapshot(q, (user) => {
        const userSnap = user.docs.map((docItem) => ({
          id: docItem.id,
          ...docItem.data(),
        }));

        setChatMessages(userSnap);

        localStorage.setItem(`chatMessages${chatId}`, JSON.stringify(userSnap));

        setStoredMessages(userSnap);
      });

      return () => {
        unSubscribe();
      };
    }
  }, [chatId, userId]);

  useEffect(() => {
    let divElem = divElement.current;
    if (divElem) {
      divElem.scrollTop = divElem.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    const GetUserChat = async () => {
      const saveChatId = JSON.parse(localStorage.getItem(`chatId${userId}`));
      if (!saveChatId) return;
      setChatId(saveChatId);

      const storedMessage =
        JSON.parse(localStorage.getItem(`chatMessages${saveChatId}`)) || [];
      const sortedStoredMessages = storedMessage.sort(
        (a, b) => a.createdAt - b.createdAt
      );

      setStoredMessages(sortedStoredMessages);
    };
    GetUserChat();
  }, [userId]);

  return (
    <div className="chats-container">
      <AsideContent
        asideView={asideView}
        userId={userId}
        chatId={chatId}
        setChatMessages={setChatMessages}
      />
      <div
        className={`user-chats-container ${changeMode && "chat-mode-switch"}`}
      >
        <div className="chats-header">
          <div className="chats-details">
            <img src={chatbotImage1} alt="" />
            <p>NuraChat</p>
          </div>
          <div className="option-icon" onClick={ViewAsideContent}>
            <img src={OptionIcon} alt="" />
            <img
              src={eyeIcon}
              className="change-mode"
              alt=""
              title="change mode"
              onClick={ChangeMode}
            />
          </div>
        </div>
        <div
          className="chat-message-container"
          onClick={DivElement}
          ref={divElement}
        >
          {chatMessages.map((messageItem) => {
            return (
              messageItem && (
                <div key={messageItem.id} className="chat-message-content">
                  {messageItem.sender === "user" ? (
                    <div className="chats-message user-chats">
                      <p>
                        {messageItem.text}
                        <span>
                          {dayjs(messageItem.createdAt).format("h:mma")}
                        </span>
                      </p>
                      <img
                        src={
                          userData?.avater ? userData?.avater : UserProfilePic
                        }
                        alt=""
                      />
                    </div>
                  ) : (
                    <div className="chats-message robot-chats">
                      <img src={chatbotImage1} alt="" />
                      <p>
                        {messageItem.status === "loading" ? (
                          <img src={LoadingIcon} className="loading-icon" />
                        ) : (
                          messageItem.text
                        )}
                        <span>
                          {dayjs(messageItem.createdAt).format("h:mma")}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )
            );
          })}
        </div>
        <div className="send-message">
          <input
            type="text"
            placeholder="Send message"
            onChange={GetInputText}
            onKeyDown={EnterToSendMessage}
            value={inputText}
          />
          <img src={SendIcon} onClick={SendMessage} alt="" />
        </div>
        <div className="swich-mode-container" onClick={ChangeMode}>
          <img src={eyeIcon} alt="" title="change mode" />
        </div>
      </div>
    </div>
  );
};

export default Chats;
