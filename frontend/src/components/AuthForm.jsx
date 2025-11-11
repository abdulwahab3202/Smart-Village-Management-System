import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthForm = ({ onClose }) => {
  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {isLoginView ? (
        <LoginForm onClose={onClose} onToggleView={() => setIsLoginView(false)} />
      ) : (
        <RegisterForm onClose={onClose} onToggleView={() => setIsLoginView(true)} />
      )}
    </div>
  );
};

export default AuthForm;