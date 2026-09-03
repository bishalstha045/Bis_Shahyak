import React, { useEffect } from 'react';
import AuthView from './AuthView';

export default function AuthModal({ isOpen, onClose, auth, initialMode = 'login', onNavigate }) {
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

  const modeToUse = auth?.needsOrgOnboarding 
    ? 'org_onboarding' 
    : auth?.pendingVerification 
      ? 'signup' 
      : initialMode;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#fbfcfd] flex flex-col justify-start animate-fade-in">
      <AuthView
        initialMode={modeToUse}
        auth={auth}
        onClose={onClose}
        onAuthSuccess={onClose}
        onNavigate={(tab) => {
          if (onClose) onClose();
          if (onNavigate) onNavigate(tab);
        }}
      />
    </div>
  );
}
