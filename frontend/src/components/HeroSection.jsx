import React, { useContext } from 'react';
import { StoreContext } from '../context/StoreContext';
import Swal from 'sweetalert2';
const HeroSection = ({ onReportClick }) => {
  const { isSignedIn, currentUser } = useContext(StoreContext);

  const handleReportButtonClick = () => {
    if (isSignedIn && currentUser && currentUser.role === 'CITIZEN') {
      onReportClick();
    } else if (isSignedIn) {
      Swal.fire({
        title: 'Permission Denied',
        text: 'This feature is available for citizens only.',
        icon: 'info'
      });
    } else {
      Swal.fire({
        title: 'Not Logged In',
        text: 'Please sign in to report an issue.',
        icon: 'warning'
      });
    }
  };

  return (
    <section className="bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight">
          Report Civic Issues. <span className="text-indigo-600">See Real Change.</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-600">
          Your voice matters. Submit complaints about potholes, sanitation, or public services and track their resolution in real-time. Let's build a better city, together.
        </p>
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={handleReportButtonClick}
            className="bg-indigo-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-colors duration-300 shadow-lg transform hover:-translate-y-0.5"
          >
            Report an Issue
          </button>
          <a
            href="#how-it-works"
            className="bg-slate-200 text-slate-800 font-semibold py-3 px-8 rounded-lg hover:bg-slate-300 transition-colors duration-300"
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;