import React from 'react';
import { LoginForm } from './LoginForm';

export function AuthenticationScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <div className="fixed inset-0 z-0">
        <img 
          src="/assets/background.gif" 
          alt="Background" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="w-full max-w-md relative z-10">
        <h1 className="text-4xl font-bold text-white text-center mb-8">Welcome to son<span className="text-yellow-400">IQ</span>ue challenge</h1>
        <LoginForm />
      </div>
    </div>
  );
}
