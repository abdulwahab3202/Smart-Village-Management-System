import React, { useState, useContext } from 'react';
import { StoreContext } from '../context/StoreContext';
import { LoadingSpinner } from './Icons';
import Swal from 'sweetalert2';

const FormInput = ({ label, name, error, ...props }) => (
  <div className="mb-2">
    <label htmlFor={name} className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
    <input 
      id={name} name={name} {...props}
      className={`block w-full px-3 py-2 bg-slate-50 border rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
    />
    <p className="mt-1 text-sm text-red-600 h-5">{error || ''}</p>
  </div>
);

const LoginForm = ({ onClose, onToggleView }) => {
  const { login } = useContext(StoreContext);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prevErrors => ({ ...prevErrors, [name]: undefined }));
    }
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});
    
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required.';
    else if (!validateEmail(formData.email)) newErrors.email = 'Please enter a valid email address.';
    if (!formData.password) newErrors.password = 'Password is required.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    try {
      const data = await login(formData.email, formData.password);
      if (data.responseStatus !== 'SUCCESS') throw new Error(data.message || 'Login failed.');
      onClose();
    } catch (err) {
      Swal.fire({
        title: 'Login Failed',
        text: err.message,
        icon: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md p-8 bg-white rounded-xl shadow-2xl">
      <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
      
      <h1 className="text-3xl font-bold text-center text-slate-800">Welcome Back</h1>
      
      <form onSubmit={handleLogin} className="mt-2 space-y-2">
        <FormInput 
          label="Email Address" 
          name="email" 
          type="email" 
          value={formData.email} 
          error={errors.email} 
          onChange={handleInputChange} 
        />
        <FormInput 
          label="Password" 
          name="password" 
          type="password" 
          value={formData.password} 
          error={errors.password} 
          onChange={handleInputChange} 
        />
        <div className="pt-4">
          <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-base font-semibold text-white 
                         bg-gradient-to-r from-blue-600 to-blue-500
                         hover:from-blue-500 hover:to-blue-600
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                         transform hover:-translate-y-0.5 transition-all duration-300
                         disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed">
            {isLoading && <LoadingSpinner />}
            Login
          </button>
        </div>
      </form>

      <p className="text-sm text-center text-slate-500 pt-4 border-t border-slate-200 mt-6">
        Don't have an account?
        <button onClick={onToggleView} className="font-semibold text-blue-600 hover:text-blue-500 ml-1">
          Sign Up
        </button>
      </p>
    </div>
  );
};

export default LoginForm;