import { AppContext } from "../context/CreateContext";
import { useContext } from "react";
import chatbotImage2 from "../assets/chatbot-1.png";
import { HandleSendResetCode} from "../firebaseConfig/firebaseConfig";
import { toast } from "react-toastify";
import "./ResetPassword.css";

export const ResetPassword = () => {
  const {
    email,
    HandleSubmit,
    setEmail,
    setRegState,
  } = useContext(AppContext);

  const GetEmailText = (event) => {
    setEmail(event.target.value);
  };
  const NavToSignIn = () => {
    setRegState("signin");
  };
  const SendVerification = async () => {
    try {
      await HandleSendResetCode(email);
      setEmail('')
    } catch (error) {
      console.log(error);
      toast.error(error.code?.split("/")[1]?.split("-")?.join(" "));
    }
  };

  return (
    <div className="signup-form">
      <div className="signup-header">
        <img src={chatbotImage2} alt="" />
        <h4>Password Reset</h4>
      </div>
      <form className="form-field" onSubmit={HandleSubmit}>
        <div className="reset-password-container">
          <input
            type="email"
            placeholder="Enter your email"
            className="email-prompt"
            autoComplete="off"
            required
            onChange={GetEmailText}
            value={email}
          />
          <button type="submit" className="signup" onClick={SendVerification}>
            Reset
          </button>
        </div>
        <p>
          Back to login <span onClick={NavToSignIn}>click here</span>
        </p>
      </form>
    </div>
  );
};
