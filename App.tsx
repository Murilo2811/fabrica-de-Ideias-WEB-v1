
import React, { useState, useRef, useEffect } from 'react';
import { ServicesProvider, useServices } from './contexts/ServicesContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Header from './components/Header';
import NavigationBar from './components/NavigationBar';
import OverviewSection from './components/OverviewSection';
import ClusterAnalysisSection from './components/ClusterAnalysisSection';
import IdeaGeneratorSection from './components/IdeaGeneratorSection';
import PrioritizationSection from './components/PrioritizationSection';
import ServiceExplorerSection from './components/ServiceExplorerSection';
import ChatWidget from './components/ChatWidget';
import Footer from './components/Footer';
import Loader from './components/Loader';
import Notification from './components/Notification';
import HelpModal from './components/HelpModal';
import AuthPage from './components/AuthPage';
import type { User } from './types';


const AppContent: React.FC = () => {
  const { isAuthenticated, user, logout, isLoading: isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
          <Loader text="Carregando sessão..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }
  
  return <MainApp user={user} onLogout={logout} />;
};


const MainApp: React.FC<{ user: User | null; onLogout: () => void; }> = ({ user, onLogout }) => {
  const { isLoading, loadingMessage, appError, notification } = useServices();
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [highlightedClusterId, setHighlightedClusterId] = useState<string | null>(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const sections: { [key: string]: React.RefObject<HTMLElement> } = {
    overview: useRef<HTMLElement>(null),
    clusterAnalysis: useRef<HTMLElement>(null),
    ideaGenerator: useRef<HTMLElement>(null),
    prioritization: useRef<HTMLElement>(null),
    serviceExplorer: useRef<HTMLElement>(null),
  };
  
  useEffect(() => {
    const clearHighlight = () => setHighlightedClusterId(null);
    document.addEventListener('click', clearHighlight);
    return () => document.removeEventListener('click', clearHighlight);
  }, []);

  const handleNavigate = (sectionId: string) => {
    sections[sectionId].current?.scrollIntoView({ behavior: 'smooth' });
    setActiveSection(sectionId);
  };
  
  const handleClusterNavigate = (clusterId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const element = document.getElementById(`cluster-card-${clusterId}`);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlightedClusterId(clusterId);
        setActiveSection('clusterAnalysis');
    }
  };

  if (isLoading && !appError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <Loader text={loadingMessage} />
      </div>
    );
  }

  if (appError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erro ao carregar dados</h2>
          <p className="text-gray-700">{appError}</p>
          <p className="text-gray-500 mt-4 text-sm">
            Por favor, verifique sua conexão com a internet, se a URL do App da Web em `services/googleSheetService.ts` está correta e se o script foi implantado corretamente com as permissões de acesso para "Qualquer pessoa". As colunas da planilha também devem estar corretas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 text-gray-800 font-sans">
      {notification && <Notification message={notification.message} type={notification.type} />}
      <Header onHelpClick={() => setIsHelpModalOpen(true)} user={user} onLogout={onLogout} />
      <NavigationBar onNavigate={handleNavigate} activeSection={activeSection} />

      <main className="container mx-auto p-4 md:p-8">
        <OverviewSection ref={sections.overview} onClusterClick={handleClusterNavigate} />
        <ClusterAnalysisSection ref={sections.clusterAnalysis} highlightedClusterId={highlightedClusterId} />
        <IdeaGeneratorSection ref={sections.ideaGenerator} />
        <PrioritizationSection ref={sections.prioritization} />
        <ServiceExplorerSection ref={sections.serviceExplorer} />
      </main>
      
      <ChatWidget />
      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
      <Footer />
    </div>
  );
}


const App: React.FC = () => {
  return (
    <AuthProvider>
      <ServicesProvider>
        <AppContent />
      </ServicesProvider>
    </AuthProvider>
  );
};

export default App;