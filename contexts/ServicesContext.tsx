
import React, { createContext, useState, useCallback, useEffect, useContext, ReactNode } from 'react';
import type { Service } from '../types';
import { getServices, addServiceToSheet, updateServiceInSheet, deleteServiceFromSheet, bulkUpdateServicesInSheet, WEB_APP_URL } from '../services/googleSheetService';
import { getAIRanking } from '../services/geminiService';
import { criteriaData } from '../data/criteriaData';
import { mapBusinessModel } from '../utils/businessModelMapper';

type NotificationType = 'success' | 'error' | 'info';

interface NotificationState {
  message: string;
  type: NotificationType;
  id: number;
}

interface ServicesContextType {
  services: Service[];
  isLoading: boolean;
  isRanking: boolean;
  isRefreshing: boolean;
  loadingMessage: string;
  appError: string | null;
  notification: NotificationState | null;

  addService: (service: Omit<Service, 'id' | 'creationDate' | 'scores' | 'revenueEstimate'>) => Promise<void>;
  updateService: (updatedService: Service) => Promise<void>;
  deleteService: (idToDelete: number) => Promise<void>;
  applyAIRanking: () => Promise<void>;
  downloadCSV: () => void;
  refreshData: () => void;
}

const ServicesContext = createContext<ServicesContextType | undefined>(undefined);

export const ServicesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRanking, setIsRanking] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Conectando ao banco de ideias...');
  const [appError, setAppError] = useState<string | null>(null);
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const showNotification = (message: string, type: NotificationType = 'info') => {
    const newNotification = { message, type, id: Date.now() };
    setNotification(newNotification);
    setTimeout(() => {
        setNotification(current => current?.id === newNotification.id ? null : current);
    }, 5000);
  };

  const fetchData = useCallback(async (message: string) => {
    setIsLoading(true);
    setLoadingMessage(message);
    setAppError(null);
    try {
      const sheetServices = await getServices();
      const sanitizedServices = sheetServices.map(s => ({
        ...s,
        scores: Array.isArray(s.scores) ? s.scores : Array(criteriaData.length).fill(0),
      }));
      setServices(sanitizedServices);
    } catch (err: any) {
      console.error("Failed to load data from sheet:", err);
      setAppError(err.message || 'Ocorreu um erro desconhecido ao carregar os dados.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData('Conectando ao banco de ideias...');
  }, [fetchData]);

  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    setLoadingMessage('Atualizando ideias da planilha...');
    await fetchData('Atualizando ideias da planilha...');
    showNotification('Dados sincronizados com sucesso!', 'success');
    setIsRefreshing(false);
  }, [fetchData]);

  const addService = useCallback(async (service: Omit<Service, 'id' | 'creationDate' | 'scores' | 'revenueEstimate'>) => {
    try {
        const newService = await addServiceToSheet(service);
        const sanitizedNewService = {
          ...newService,
          scores: Array.isArray(newService.scores) ? newService.scores : Array(criteriaData.length).fill(0),
        };
        setServices(prevServices => [...prevServices, sanitizedNewService]);
        showNotification('Ideia adicionada com sucesso!', 'success');
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        showNotification(`Falha ao adicionar a ideia: ${errorMessage}`, 'error');
        throw error;
    }
  }, []);

  const updateService = useCallback(async (updatedService: Service) => {
    try {
      await updateServiceInSheet(updatedService);
      setServices(prevServices =>
        prevServices.map(s => (s.id === updatedService.id ? updatedService : s))
      );
      showNotification('Ideia salva com sucesso!', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      showNotification(`Falha ao salvar a ideia: ${errorMessage}`, 'error');
      throw error;
    }
  }, []);

  const deleteService = useCallback(async (idToDelete: number) => {
    try {
      await deleteServiceFromSheet(idToDelete);
      setServices(prevServices => prevServices.filter(s => s.id !== idToDelete));
      showNotification('Ideia excluída com sucesso.', 'success');
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        showNotification(`Falha ao excluir a ideia: ${errorMessage}`, 'error');
        throw error;
    }
  }, []);

  const applyAIRanking = useCallback(async () => {
    if (services.length === 0) {
      showNotification("Não há ideias para analisar.", 'info');
      return;
    }
    setIsRanking(true);
    setLoadingMessage('A IA está avaliando as ideias...');
    try {
      const aiRankings = await getAIRanking(services);
      const rankingMap = new Map(aiRankings.map(r => [r.id, r]));
      
      const updatedServices = services.map(s => {
        const rankData = rankingMap.get(s.id);
        return rankData ? { ...s, scores: rankData.scores } : s;
      });
      
      setServices(updatedServices);
      showNotification('Análise da IA concluída. Salvando...', 'info');
      setLoadingMessage('Salvando ranking na planilha...');
      
      const servicesToUpdate = updatedServices.filter(s => rankingMap.has(s.id));
      if (servicesToUpdate.length > 0) {
        await bulkUpdateServicesInSheet(servicesToUpdate);
      }
      showNotification('Ranking salvo na planilha com sucesso!', 'success');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro ao realizar a análise ou salvar.";
      console.error("Error during AI analysis and saving:", err);
      showNotification(errorMessage, 'error');
      setAppError(errorMessage);
    } finally {
      setIsRanking(false);
    }
  }, [services]);

  const downloadCSV = useCallback(() => {
    if (services.length === 0) {
        showNotification("Não há dados para baixar.", "info");
        return;
    }

    const headers = [
        'ID', 'Serviço', 'Benefício Principal', 'Público-Alvo', 'Cluster', 'Modelo de Negócio', 'Status',
        'Criador', 'Data de Criação',
        ...criteriaData.map(c => c.title), 'Estimativa Faturamento', 'Pontuação Total'
    ];

    const escapeAndQuote = (value: string | number | undefined): string => {
        if (value === null || value === undefined) return '';
        const str = String(value).replace(/"/g, '""');
        return `"${str}"`;
    };

    const csvRows = services.map(service => {
        const total = service.scores.reduce((acc, val) => acc + val, 0);
        const rowData = [
            service.id,
            service.service,
            service.need,
            service.targetAudience || '',
            service.cluster,
            mapBusinessModel(service.businessModel),
            service.status || 'avaliação',
            service.creatorName || '',
            service.creationDate ? new Date(service.creationDate).toLocaleDateString('pt-BR') : '',
            ...service.scores,
            service.revenueEstimate || 0,
            total
        ];
        return rowData.map(escapeAndQuote).join(';');
    });

    const csvContent = [headers.join(';'), ...csvRows].join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'ideias_priorizadas.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotification('Download da planilha iniciado.', 'success');
  }, [services]);

  const value = {
    services,
    isLoading: isLoading && !isRanking && !isRefreshing,
    isRanking,
    isRefreshing,
    loadingMessage,
    appError,
    notification,
    addService,
    updateService,
    deleteService,
    applyAIRanking,
    downloadCSV,
    refreshData
  };

  return <ServicesContext.Provider value={value}>{children}</ServicesContext.Provider>;
};

export const useServices = (): ServicesContextType => {
  const context = useContext(ServicesContext);
  if (context === undefined) {
    throw new Error('useServices must be used within a ServicesProvider');
  }
  return context;
};
