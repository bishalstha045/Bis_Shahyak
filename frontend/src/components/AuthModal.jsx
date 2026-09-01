import React, { useEffect } from 'react';
import AuthView from './AuthView';

export default function AuthModal({ isOpen, onClose, auth, initialMode = 'login' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white flex flex-col justify-start animate-fade-in">
      <AuthView
        initialMode={initialMode}
        auth={auth}
        onClose={onClose}
        onAuthSuccess={onClose}
      />
    </div>
  );
}
