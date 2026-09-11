import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import HomeDashboardView from './components/HomeDashboardView';
import ComplianceView from './components/ComplianceView';
import StandardsView from './components/StandardsView';
import DocumentAnalyzerView from './components/DocumentAnalyzerView';
import VerificationView from './components/VerificationView';
import StandardComparisonView from './components/StandardComparisonView';
import NotificationsView from './components/NotificationsView';
import AdminPanel from './components/admin/AdminPanel';
import ChatInterface from './components/ChatInterface';
import ISIVerifierModal from './components/ISIVerifierModal';
import ComplianceChecklist from './components/ComplianceChecklist';
import EvidenceModal from './components/EvidenceModal';
import AuthModal from './components/AuthModal';
import ProfileModal from './components/ProfileModal';
import HelpModal from './components/HelpModal';
import { useChat } from './hooks/useChat';
import { useAuth } from './hooks/useAuth';
import { getDatasetStats } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      if (
        window.location.pathname.startsWith('/admin') ||
        window.location.hash === '#admin' ||
        window.location.hash.startsWith('#admin/') ||
        window.location.search.includes('admin=true')
      ) {
        return 'admin';
      }
    }
    return 'home';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [language, setLanguage] = useState('auto');
  const [indexedCount, setIndexedCount] = useState(24);
  const [complianceInitialQuery, setComplianceInitialQuery] = useState("I manufacture domestic pressure cookers");

  // Global Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [activeEvidence, setActiveEvidence] = useState(null);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [checklistContext, setChecklistContext] = useState(null);

  const auth = useAuth();
  const { messages, isLoading, streamingText, sendMessage, clearMessages } = useChat();

  // Listen to browser URL path and hash changes for direct /admin and #admin access
  useEffect(() => {
    const handleUrlChange = () => {
      const isPathAdmin = window.location.pathname.startsWith('/admin');
      const isHashAdmin = window.location.hash === '#admin' || window.location.hash.startsWith('#admin/');
      const isQueryAdmin = window.location.search.includes('admin=true');

      if (isPathAdmin || isHashAdmin || isQueryAdmin) {
        setActiveTab('admin');
      } else if (activeTab === 'admin') {
        setActiveTab('home');
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, [activeTab]);

  const handleTabChange = (tab) => {
    if (tab === 'admin') {
      window.history.pushState({}, '', '/admin/dashboard');
      setActiveTab('admin');
    } else {
      if (window.location.pathname.startsWith('/admin')) {
        window.history.pushState({}, '', '/');
      } else if (window.location.hash === '#admin') {
        history.pushState("", document.title, window.location.pathname + window.location.search);
      }
      setActiveTab(tab);
    }
  };

  useEffect(() => {
    getDatasetStats().then(data => {
      if (data && data.indexed_count) {
        setIndexedCount(data.indexed_count);
      }
    });
  }, []);

  // Automatically reopen AuthModal if pending verification, Google notice, or org onboarding exists
  useEffect(() => {
    if (auth?.pendingVerification || auth?.needsOrgOnboarding || auth?.googleNotice) {
      setAuthModalOpen(true);
    }
  }, [auth?.pendingVerification, auth?.needsOrgOnboarding, auth?.googleNotice]);

  const handleOpenEvidence = (ev) => {
    setActiveEvidence(ev);
    setEvidenceModalOpen(true);
  };

  const handleOpenChecklist = (ctx = null) => {
    setChecklistContext(ctx);
    setChecklistOpen(true);
  };

  const handleStartSearchFromHome = (queryText) => {
    setComplianceInitialQuery(queryText);
    setActiveTab('compliance');
  };

  const handleCheckComplianceForStandard = (std) => {
    setComplianceInitialQuery(`I manufacture ${std.applicable_products?.[0] || std.title}`);
    setActiveTab('compliance');
  };

  const handleAskAIAboutStandard = (std) => {
    sendMessage({
      query: `Tell me about ${std.id} (${std.title}), its scope, mandatory testing clauses, and certification rules.`,
      language
    });
    handleTabChange('assistant');
  };

  // Dedicated Separately Accessible Admin Control Panel
  if (activeTab === 'admin') {
    return (
      <AdminPanel
        auth={auth}
        onExitToManufacturer={() => handleTabChange('home')}
      />
    );
  }


  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#f8fafc] text-slate-900 font-sans">

      {/* Top Header Across Full Width */}
      <Header
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        language={language}
        onLanguageChange={setLanguage}
        auth={auth}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenHelp={() => setHelpModalOpen(true)}
        onTabChange={handleTabChange}
        activeTab={activeTab}
      />

      {/* Main Workspace (Sidebar + Views) */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onOpenHelp={() => setHelpModalOpen(true)}
          auth={auth}
        />

        {/* Dynamic Workspace View */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#f8fafc]">
          {activeTab === 'home' && (
            <HomeDashboardView
              onNavigate={setActiveTab}
              onStartSearch={handleStartSearchFromHome}
              onOpenEvidence={handleOpenEvidence}
              onCheckComplianceForStandard={handleCheckComplianceForStandard}
              onAskAIAboutStandard={handleAskAIAboutStandard}
              onAskAI={(queryText) => {
                sendMessage({ query: queryText, language });
                setActiveTab('assistant');
              }}
            />
          )}

          {activeTab === 'standards' && (
            <StandardsView
              onOpenEvidence={handleOpenEvidence}
              onCheckComplianceForStandard={handleCheckComplianceForStandard}
              onAskAIAboutStandard={handleAskAIAboutStandard}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'compliance' && (
            <ComplianceView
              onOpenEvidence={handleOpenEvidence}
              onOpenDocAnalyzer={() => setActiveTab('documents')}
              onOpenChecklistModal={handleOpenChecklist}
              auth={auth}
              initialQuery={complianceInitialQuery}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentAnalyzerView
              onOpenEvidence={handleOpenEvidence}
              onExportPDF={handleOpenChecklist}
            />
          )}

          {activeTab === 'verification' && (
            <VerificationView
              onOpenEvidence={handleOpenEvidence}
              onNavigate={handleTabChange}
            />
          )}

          {activeTab === 'compare' && (
            <StandardComparisonView />
          )}

          {activeTab === 'notifications' && (
            <NotificationsView
              onNavigate={setActiveTab}
              onCheckComplianceForStandard={handleCheckComplianceForStandard}
              onAskAIAboutStandard={handleAskAIAboutStandard}
              onOpenEvidence={handleOpenEvidence}
            />
          )}

          {activeTab === 'assistant' && (
            <ChatInterface
              messages={messages}
              isLoading={isLoading}
              streamingText={streamingText}
              mode="simple"
              language={language}
              onSendMessage={(q) => sendMessage({ query: q, language })}
              onOpenVerifier={() => setActiveTab('verification')}
              onOpenChecklist={handleOpenChecklist}
              onOpenEvidence={handleOpenEvidence}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        auth={auth}
        onNavigate={setActiveTab}
      />

      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        auth={auth}
        onNavigate={setActiveTab}
      />

      <HelpModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
      />

      <EvidenceModal
        isOpen={evidenceModalOpen}
        onClose={() => {
          setEvidenceModalOpen(false);
          setActiveEvidence(null);
        }}
        evidence={activeEvidence}
      />

      <ComplianceChecklist
        isOpen={checklistOpen}
        onClose={() => {
          setChecklistOpen(false);
          setChecklistContext(null);
        }}
        contextData={checklistContext}
      />
    </div>
  );
}
