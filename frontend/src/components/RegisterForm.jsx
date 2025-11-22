import React, { useState, useContext } from 'react';
import { StoreContext } from '../context/StoreContext';
import { LoadingSpinner } from './Icons';
import Swal from 'sweetalert2';
const FormInput = ({ label, name, error, ...props }) => (
  <div className="mb-2">
    <label htmlFor={name} className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
    <input 
      id={name} name={name} {...props}
      className={`block w-full px-3 py-1 bg-slate-50 border rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
    />
    {/* Fixed height for error message to prevent layout shift */}
    <p className="mt-1 text-xs text-red-600 h-4">{error || ''}</p>
  </div>
);

const FormSelect = ({ label, name, value, error, children, ...props }) => (
  <div className>
    <label htmlFor={name} className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
    <select
      id={name} name={name} value={value} {...props}
      className={`block w-full px-3 py-1 bg-slate-50 border rounded-lg shadow-sm focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
    >
      {children}
    </select>
    {/* Fixed height for error message to prevent layout shift */}
    <p className="mt-1 text-xs text-red-600 h-4">{error || ''}</p>
  </div>
);

const RegisterForm = ({ onClose, onToggleView }) => {
  const { register } = useContext(StoreContext);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'CITIZEN',
    phoneNumber: '', address: '', city: '', pinCode: '',
    specialization: 'Plumber',
  });
  
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
  const validatePhoneNumber = (phone) => /^\d{10}$/.test(phone);
  const validatePinCode = (pin) => /^\d{6}$/.test(pin);

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors({});
    
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Full name is required.';
    if (!formData.email) newErrors.email = 'Email is required.';
    else if (!validateEmail(formData.email)) newErrors.email = 'Please enter a valid email address.';
    if (!formData.password) newErrors.password = 'Password is required.';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters.';

    if (formData.role === 'CITIZEN') {
      if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required.';
      else if (!validatePhoneNumber(formData.phoneNumber)) newErrors.phoneNumber = 'Must be exactly 10 digits.';
      if (!formData.address) newErrors.address = 'Address is required.';
      if (!formData.city) newErrors.city = 'City is required.';
      if (!formData.pinCode) newErrors.pinCode = 'PIN code is required.';
      else if (!validatePinCode(formData.pinCode)) newErrors.pinCode = 'Must be exactly 6 digits.';
    } else if (formData.role === 'WORKER') {
      if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required.';
      else if (!validatePhoneNumber(formData.phoneNumber)) newErrors.phoneNumber = 'Must be exactly 10 digits.';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const data = await register(formData);
      if (data.responseStatus !== 'SUCCESS') throw new Error(data.message || 'Registration failed.');
      onClose();
    } catch (err) {
      Swal.fire({
        title: 'Registration Failed',
        text: err.message,
        icon: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-2xl pt-5 pb-5 pr-8 pl-8 bg-white rounded-xl shadow-2xl">
      <button onClick={onClose} className="absolute top-7 right-4 text-slate-400 hover:text-slate-700 transition-colors">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
      
      <h1 className="text-3xl font-bold text-center text-slate-800 mb-6">Create Your Account</h1>
      
      <form onSubmit={handleRegister} className="mt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <div className="md:col-span-2">
            <FormInput label="Full Name" name="name" type="text" value={formData.name} error={errors.name} onChange={handleInputChange} />
          </div>
          <FormInput label="Email Address" name="email" type="email" value={formData.email} error={errors.email} onChange={handleInputChange} />
          <FormInput label="Password" name="password" type="password" placeholder="At least 8 characters" value={formData.password} error={errors.password} onChange={handleInputChange} />
          <div className="md:col-span-2">
            <FormSelect label="Register as" name="role" value={formData.role} error={errors.role} onChange={handleInputChange}>
              <option value="CITIZEN">Citizen</option>
              <option value="WORKER">Worker</option>
              <option value="ADMIN">Admin</option>
            </FormSelect>
          </div>
          
          {formData.role === 'CITIZEN' && (
            <>
              <FormInput label="Phone Number (10 digits)" name="phoneNumber" type="tel" value={formData.phoneNumber} error={errors.phoneNumber} onChange={handleInputChange} />
              <FormInput label="Address" name="address" type="text" value={formData.address} error={errors.address} onChange={handleInputChange} />
              <FormInput label="City" name="city" type="text" value={formData.city} error={errors.city} onChange={handleInputChange} />
              <FormInput label="PIN Code (6 digits)" name="pinCode" type="number" value={formData.pinCode} error={errors.pinCode} onChange={handleInputChange} />
            </>
          )}
          
          {formData.role === 'WORKER' && (
            <>
              <FormInput label="Phone Number (10 digits)" name="phoneNumber" type="tel" value={formData.phoneNumber} error={errors.phoneNumber} onChange={handleInputChange} />
              <FormSelect label="Specialization" name="specialization" value={formData.specialization} error={errors.specialization} onChange={handleInputChange}>
                <option value="Plumber">Plumber</option>
                <option value="Electrician">Electrician</option>
                <option value="Cleaner">Cleaner</option>
              </FormSelect>
            </>
          )}
        </div>

        <div className="pt-4">
          <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-base font-semibold text-white 
                         bg-gradient-to-r from-blue-600 to-blue-500
                         hover:from-blue-500 hover:to-blue-600
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                         transform hover:-translate-y-0.5 transition-all duration-300
                         disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed">
            {isLoading && <LoadingSpinner />}
            Create Account
          </button>
        </div>
      </form>

      <p className="text-sm text-center text-slate-500 pt-3 border-t border-slate-200 mt-2">
        Already have an account?
        <button onClick={onToggleView} className="font-semibold text-blue-600 hover:text-blue-500 ml-1">
          Login
        </button>
      </p>
    </div>
  );
};

export default RegisterForm;