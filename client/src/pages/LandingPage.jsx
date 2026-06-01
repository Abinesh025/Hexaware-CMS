import React from 'react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { Link } from 'react-router-dom'
import landImage from '../assets/land2.jpg'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-ink-950 transition-colors duration-300">
      <Navbar />

      <div className="font-sans text-gray-800 flex-1">
        {/* HERO SECTION */}
        <section
          className="min-h-screen bg-cover bg-center flex items-center justify-center text-white relative"
          style={{ backgroundImage: `url(${landImage})` }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/55"></div>

          <div className="relative z-10 px-4 sm:px-10 py-12 rounded-2xl text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-5.5xl font-bold mb-4 leading-tight">
              H.I.T College of Engineering
            </h1>
            <p className="mb-8 font-semibold text-base sm:text-lg text-white/90">
              Excellence in Education
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/register">
                <button className="w-full sm:w-auto px-8 py-3 bg-rose-600 hover:bg-rose-700 font-semibold rounded-xl transition-colors text-white">
                  Get Started
                </button>
              </Link>
              <Link to="/login">
                <button className="w-full sm:w-auto px-8 py-3 btn-primary font-semibold rounded-xl">
                  Login
                </button>
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
