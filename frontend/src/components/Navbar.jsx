import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import { CloseIcon, MenuIcon, ChevronDownIcon } from './Icons';
const SmartLink = ({ to, children, className, onClick }) => {
  const location = useLocation();

  if (to.startsWith('/#')) {
    const id = to.substring(2);
    const isHomePage = location.pathname === '/';
    
    const handleClick = (e) => {
      e.preventDefault();
      if (onClick) onClick(); 
      if (isHomePage) {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        window.location.href = to;
      }
    };
    
    return <a href={to} onClick={handleClick} className={className}>{children}</a>;
  }
  return <Link to={to} className={className} onClick={onClick}>{children}</Link>;
};

const Navbar = ({ onSignInClick }) => {
  const { isSignedIn, currentUser, logout } = useContext(StoreContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();
  let navLinks = [
    { to: '/', label: 'Home' },
    { to: '/#how-it-works', label: 'How It Works' },
    { to: '/#features', label: 'Features' },
  ];

  if (isSignedIn) {
    navLinks.push({ to: '/complaints', label: 'Complaints' });
  }
  
  const handleSignInClick = () => {
    onSignInClick();
    setIsMobileMenuOpen(false);
  };

  const handleLogoutClick = () => {
    logout();
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
    navigate('/');
  }

  const handleDropdownLinkClick = () => {
    setIsProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
  }

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="CivicResolve Logo" className="h-10 w-auto" />
              <span className="text-xl font-bold text-slate-950">CivicResolve</span>
            </Link>
          </div>

          <nav className="hidden md:flex md:items-center md:space-x-8">
            {navLinks.map((link) => (
              <SmartLink key={link.to} to={link.to} className="text-slate-600 hover:text-indigo-600 transition-colors duration-200 font-medium">
                {link.label}
              </SmartLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {isSignedIn ? (
              <div className="relative">
                <button 
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} 
                  className="flex items-center space-x-2"
                >
                  <img src="https://ik.imagekit.io/abdulwahab/images/profile.png?updatedAt=1748609998901" className='h-10 w-10 rounded-full cursor-pointer' alt='profile'/>
                  <ChevronDownIcon />
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-50 ring-1 ring-black ring-opacity-5">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                      <Link to="/profile" onClick={handleDropdownLinkClick} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100" role="menuitem">
                        My Profile
                      </Link>
                      
                      {currentUser && currentUser.role === 'ADMIN' && (
                        <>
                          <hr className="my-1 border-slate-200" />
                          <Link to="/admin/complaints" onClick={handleDropdownLinkClick} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100" role="menuitem">
                            Complaint Mgmt
                          </Link>
                          <Link to="/admin/users" onClick={handleDropdownLinkClick} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100" role="menuitem">
                            User Mgmt
                          </Link>
                          <Link to="/admin/worker-assignments" onClick={handleDropdownLinkClick} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100" role="menuitem">
                            Worker & Assignment Mgmt
                          </Link>
                        </>
                      )}
                      
                      <hr className="my-1 border-slate-200" />
                      <button
                        onClick={handleLogoutClick}
                        className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-slate-100" role="menuitem"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleSignInClick}
                className="bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-sm"
              >
                Sign In
              </button>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-600 hover:text-slate-800 hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <SmartLink key={link.to} to={link.to} onClick={handleDropdownLinkClick} className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-100">
                {link.label}
              </SmartLink>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-slate-200">
            <div className="px-2">
              {isSignedIn ? (
                <button
                  onClick={handleLogoutClick}
                  className="w-full text-center block bg-red-500 text-white font-semibold py-2 px-5 rounded-lg"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={handleSignInClick}
                  className="w-full text-center block bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-indigo-700"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;