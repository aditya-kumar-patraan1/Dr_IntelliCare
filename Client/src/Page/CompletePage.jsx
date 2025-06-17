import React from 'react'
import Navbar from '../Components/Navbar'
import Hero from '../Components/Hero'
import LocationFeature from '../Components/LocationFeature'
import AIDoctorFeature from '../Components/AIDoctorFeature'
import About from '../Components/About'
import Footer from '../Components/Footer'
import MyMap from '../Tracker/MyMap'
import MeetingFeature from '../Components/MeetingFeature'
import Dashboard from '../Components/Dashboard'
import ScrollToTop from '../Components/ScrollToTop'

const CompletePage = () => {
  return (
    <>
    {/* <h1 className="text-xl font-bold mb-4">Google Map Example</h1> */}
    {/* <MyMap /> */}
    {/* <Dashboard/> */}
    <Navbar/>
    <Hero/>
    <LocationFeature/>
    <AIDoctorFeature/>
    <MeetingFeature/>
    <ScrollToTop/>
    <About/>
    <Footer/>
    </>
)
}

export default CompletePage