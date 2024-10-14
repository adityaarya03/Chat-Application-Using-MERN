import { Route,Routes } from 'react-router-dom';
import './App.css';
import Login from './pages/Login/Login';
import Navbar from './pages/Navbar/Navbar';
import Signup from './pages/Signup/Signup';
import MainContainer from './Components/Main/MainContainer';
import Welcome from './Components/welcome/Welcome';
import ChatArea from './Components/chatArea/ChatArea';
import Creategroup from './Components/welcome/Creategroup';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Users from './pages/users/Users';
import VerifyOtp from './pages/verificationPage/VerifyOtp';
import Groups from './pages/Groups/Groups';
import { useSelector } from 'react-redux';
import SideBar from './Components/Sidebar/SideBar';
// import Conversationuser from './Components/Conversationuser';

function App() {
  const lightTheme= useSelector((state)=>state.themeKey);

  return (
    <div className={"App "+ (lightTheme ? "" : "dark")}>
      <ToastContainer/>
      <Routes>
        <Route path="/" element={<Navbar/>}>
          <Route index element={<Login/>}/>
          <Route path="signup" element={<Signup/>} />
          <Route path='signup/verify' element={<VerifyOtp/>}/>
        </Route>
        <Route path='app' element={<MainContainer/>} >
            <Route path='welcome' element={<Welcome/>} />
            <Route path='chat/:_id' element={<ChatArea/>} />
            <Route path='create-groups' element={<Creategroup/>} />
            <Route path='users' element={<Users/>} />
            <Route path='joinGroup' element={<Groups/>}/>
            {/* <Route path='usersChat' element={<Conversationuser/>}/> */}
        </Route>
      </Routes>
    </div>
  );
}


export default App;
