import { AppContext } from "../context/CreateContext";
import { useContext} from "react";
import chatbotImage2 from "../assets/chatbot-1.png";
import eyeIcon from "../assets/eye-icon.png";

export const Login = () => {

  const {
    viewPassword,
    email,
    password,
    HandleSubmit,
    setRegState,
    setEmail,
    setPassword,
    setViewPassword,
  } = useContext(AppContext);

  const NavToSignUp = () => {
    setRegState("signup");
  };
  const NavPass = () => {
    setRegState("resetpass");
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
    <div className="signup-form">
      <div className="signup-header">
        <img src={chatbotImage2} alt="" />
        <h4>Welcome! Login</h4>
      </div>
      <form className="form-field" autocomplete="on" onSubmit={HandleSubmit}>
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
          Sign in
        </button>
        <p>
          Dont have an account? <span onClick={NavToSignUp}>Sign up</span>
        </p>
        <p>
          forgot password? <span onClick={NavPass}>click here</span>
        </p>
      </form>
    </div>
  );
};
