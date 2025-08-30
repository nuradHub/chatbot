import chatbotImage from '../assets/chatbot-3.gif'
import chatbotImage2 from '../assets/chatbot-1.png'
import './HomePage.css';
import { useNavigate } from 'react-router-dom';

const HomePage = ()=> {

  const navigate = useNavigate();

  function GetStarted(){
    navigate('signup')
  }

  function SignUp(){
    navigate('signup')
  }
  return(
    <div className='container'>
      <div className='nurad-chat-icon'>
        <img src={chatbotImage2} alt="" />
       NuraChat
       </div>
      <div className='chatbot-contents'>
        <div className='chatbot-image'>
          <img src={chatbotImage} alt="" />
        </div>

        <div className='chatbot-details'>
        <h3><span className='d1'>Providing</span> <span className='d2'>The </span> <span className='d3'>Best </span><span className='d4'>Solutions</span></h3>
        <p>AI assistant can answer any of your question. Just ask!</p>
        <button className='get-started-button' onClick={GetStarted}>Click to get Started </button>
      <div className='existing-account'>
        <p>Already have an account? <span onClick={SignUp}>Sign in</span></p>
      </div>
      </div>
        </div>
      
    </div>
  )
}

export default HomePage