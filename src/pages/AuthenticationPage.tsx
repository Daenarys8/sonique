import React from 'react';
import { AuthenticationScreen } from '../components/AuthenticationScreen';

const AuthenticationPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <AuthenticationScreen />
    </div>
  );
};

export default AuthenticationPage;