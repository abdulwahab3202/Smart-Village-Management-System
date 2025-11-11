import React from 'react';
import { LogoIcon } from './Icons';

const Footer = () => {
  return (
    <footer id="about" className="bg-slate-800 text-slate-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <LogoIcon />
              <span className="text-xl font-bold text-white">CivicResolve</span>
            </div>
            <p className="text-slate-400">Improving our city, together.</p>
          </div>
          <div>
            <h3 className="font-semibold text-white tracking-wider uppercase">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#how-it-works" className="hover:text-white scroll-smooth">How It Works</a></li>
              <li><a href="#features" className="hover:text-white">Features</a></li>
              <li><a href="#" className="hover:text-white">Sign In</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white tracking-wider uppercase">Contact</h3>
            <ul className="mt-4 space-y-2">
              <li><p>Coimbatore, Tamil Nadu, India</p></li>
              <li><a href="#" className="hover:text-white">contact@civicresolve.gov</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-700 text-center text-slate-400">
          <p>&copy; {new Date().getFullYear()} CivicResolve. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
