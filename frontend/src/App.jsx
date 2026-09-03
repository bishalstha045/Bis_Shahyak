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
import ChatInterface from './components/ChatInterface';
import ISIVerifierModal from './components/ISIVerifierModal';
import ComplianceChecklist from './components/ComplianceChecklist';
import EvidenceModal from './components/EvidenceModal';
import AuthModal from './components/AuthModal';
import HelpModal from './components/HelpModal';
import { useChat } from './hooks/useChat';
import { useAuth } from './hooks/useAuth';
import { getDatasetStats } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'standards' | 'compliance' | 'documents' | 'verification' | 'compare' | 'assistant' | 'notifications'
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [language, setLanguage] = useState('auto');
  const [indexedCount, setIndexedCount] = useState(21);
  const [complianceInitialQuery, setComplianceInitialQuery] = useState("I manufacture stainless steel water bottles");

  // Global Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [activeEvidence, setActiveEvidence] = useState(null);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [checklistContext, setChecklistContext] = useState(null);

  const auth = useAuth();
  const { messages, isLoading, streamingText, sendMessage, clearMessages } = useChat();

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
    setActiveTab('assistant');
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#f8fafc] text-slate-900 font-sans">

      {/* Top Header Across Full Width */}
      <Header
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        language={language}
        onLanguageChange={setLanguage}
        auth={auth}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onOpenHelp={() => setHelpModalOpen(true)}
        onTabChange={setActiveTab}
        activeTab={activeTab}
      />

      {/* Main Workspace (Sidebar + Views) */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenHelp={() => setHelpModalOpen(true)}
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
