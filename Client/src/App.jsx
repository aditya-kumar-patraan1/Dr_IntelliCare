import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Navbar from './Components/Navbar'
import CompletePage from './Page/CompletePage'
import About from './Components/About'
import Contact from './Components/Contact'
import AIHealthAssistant from './AI DOCTOR/AIHealthAssistant'
import Hero from './Components/Hero'
import LocationFeature from './Components/LocationFeature'
import LocationTracker from './Tracker/LocationTracker'
import AIDoctorFeature from './Components/AIDoctorFeature'
import Footer from './Components/Footer'
import { MyScreen } from './CameraSecurity/screens/MyScreen'
import LobbyScreen from './CameraSecurity/screens/Lobby';
import Docs from './Components/Docs'
import Developer from './Components/Developer'
import MeetingFeature from './Components/MeetingFeature'
import Dashboard from './Components/Dashboard'
import Login from './Auth/Login'
import Register from './Auth/Register'
import RegisteredEmail from './Auth/RegisteredEmail'
import EnterOTPforPassword from './Auth/EnterOTPforPassword'
import ResetPassword from './Auth/ResetPassword'
import VerifyEmail from './Auth/VerifyEmail'
import ProfileSection from './Components/ProfileSection'
import AppointmentTabel from './Components/AppointmentTabel'

function App() {

  return (
    <>
    <Routes>
      <Route element={<CompletePage/>} path="/"/>
      <Route element={<Navbar/>} path={"/Navbar"}/>
      <Route element={<About/>} path={"/About"}/>
      <Route element={<Contact/>} path={"/Contact"}/>
      <Route element={<AIHealthAssistant/>} path={"/AIHealthAssistant"}/>
      <Route element={<Hero/>} path={"/Hero"}/>
      <Route element={<LocationFeature/>} path={"/LocationFeature"}/>
      <Route element={<LocationTracker/>} path={"/LocationTracker"}/>
      <Route element={<AIDoctorFeature/>} path={"/AIDoctorFeature"}/>
      <Route element={<About/>} path={"/About"}/>
      <Route element={<Footer/>} path={"/Footer"}/>
      <Route element={<MyScreen/>} path={"/MeetingRoom"}/>
      <Route path="/LoginPage" element={<Login/>}/>
      <Route path="/LobbyPage" element={<LobbyScreen/>}/>
      <Route path="/Docs" element={<Docs/>}/>
      <Route path="/Developer" element={<Developer/>}/>
      <Route path="/MeetingFeature" element={<MeetingFeature/>}/>
      <Route path="/Dashboard" element={<Dashboard/>}/>
      <Route path="/RegisterPage" element={<Register/>}/>
      <Route path="/EnterOTPforPassword" element={<EnterOTPforPassword/>}/>
      <Route path="/RegisteredEmail" element={<RegisteredEmail/>}/>
      <Route path="/ResetPassword" element={<ResetPassword/>}/>
      <Route path="/VerifyEmail" element={<VerifyEmail/>}/>
      <Route path="/MyScreen/:roomid" element={<MyScreen/>}/>
      <Route path="/ProfileSection" element={<ProfileSection/>}/>
      <Route path="/AppointmentTabel" element={<AppointmentTabel/>}/>
      <Route path="/VerifyEmail" element={<VerifyEmail/>}/>
      {/* Add more routes as needed */}
    </Routes>
    </>
  )
}

export default App
