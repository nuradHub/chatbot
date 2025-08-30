import "../pages/HomePage";
import "./SignUp.css";
import { useContext } from "react";
import { AppContext } from "../context/CreateContext";
import { ResetPassword } from "./ResetPassword";
import { Login } from "./Login";
import RobotImage from "../assets/robot-image.png";
import chatbotImage2 from "../assets/chatbot-1.png";
import eyeIcon from "../assets/eye-icon.png";

const SignUp = () => {

  const {
    regState,
    setRegState,
    setEmail,
    setPassword,
    setViewPassword,
    viewPassword,
    email,
    password,
    HandleSubmit,
    GoogleSignin,
  } = useContext(AppContext);

  const NavToSignIn = () => {
    setRegState("signin");
  };
  const GetEmailText = (event) => {
    setEmail(event.target.value);
  };
  const GetPasswordText = (event) => {
    setPassword(event.target.value);
  };
  const ViewPassword = () => {
    setViewPassword(!viewPassword);
  };

  return (
    <div className="signup-container">
      <div className="robot-image-container">
        <img src={RobotImage} alt="" />
      </div>
      {regState === "signup" ? (
        <div className="signup-form">
          <div className="signup-header">
            <img src={chatbotImage2} alt="" />
            <h4>Welcome! Sign up</h4>
          </div>
          <form className="form-field" onSubmit={HandleSubmit}>
            <input
              type="email"
              placeholder="Enter your email"
              className="email-prompt"
              autoComplete="off"
              required
              onChange={GetEmailText}
              value={email}
            />

            <div className="input-eye-container">
              <input
                type={!viewPassword ? "password" : "text"}
                placeholder="Enter your password"
                className="password-prompt"
                autoComplete="off"
                required
                onChange={GetPasswordText}
                value={password}
              />
              <span onClick={ViewPassword}>
                <img src={eyeIcon} alt="" />
              </span>
            </div>

            <button type="submit" className="signup" >
              Sign up
            </button>
            <p>
              Already have an account?{" "}
              <span onClick={NavToSignIn}>Sign in</span>
            </p>
            <div className="option-signup">or</div>
            <button type="button" className="google" onClick={GoogleSignin}>
              Continue with google
            </button>
          </form>
        </div>
      ) : regState === "signin" ? (
        <Login />
      ) : (
        <ResetPassword />
      )}
    </div>
  );
};

export default SignUp;
