
import React, { useState, forwardRef, useMemo, useCallback } from 'react';
import type { Service, ServiceStatus } from '../types';
import Section from './Section';
import Loader from './Loader';
import Modal from './Modal';
import { useServices } from '../contexts/ServicesContext';
import { criteriaData, Criterion } from '../data/criteriaData';

interface PrioritizationSectionProps {}

type SavingState = {
  [serviceId: number]: {
    [field: string]: boolean; // field can be `score_INDEX` or `revenue`
  };
};

const getClassification = (score: number) => {
  if (score >= 21) return { text: 'Altíssima', color: 'bg-green-600 text-white' };
  if (score >= 16) return { text: 'Alta', color: 'bg-blue-500 text-white' };
  if (score >= 11) return { text: 'Média', color: 'bg-yellow-400 text-gray-800' };
  return { text: 'Baixa', color: 'bg-red-500 text-white' };
};

const revenueCriterion: Criterion = {
  id: 6,
  title: 'Estimativa de Faturamento Anual',
  shortTitle: 'Est. Faturamento',
  description: 'Avalia o potencial de receita de cada ideia de serviço, com base em projeções de contribuição direta, capacidade de geração de receita recorrente, impacto em vendas adicionais e rentabilidade geral.',
  subCriteria: [
    'Contribuição para a Meta de R$ 1 Bilhão em Serviços: Qual a projeção de receita direta que este serviço pode gerar?',
    'Geração de Receita Recorrente: O modelo permite a criação de um fluxo de receita previsível (assinaturas, mensalidades)?',
    'Impacto no Ticket Médio e Vendas Adicionais: O serviço impulsiona o cross-sell/upsell de outros produtos e serviços?',
    'Rentabilidade e Eficiência: O serviço possui uma margem de lucro atrativa e pode ser operado de forma eficiente?',
  ],
};

const RankingTable: React.FC<{
  data: (Service & { total: number })[];
  onUpdateService: (service: Service) => Promise<void>;
  onHeaderClick: (criterion: Criterion) => void;
}> = ({ data, onUpdateService, onHeaderClick }) => {
  
  const [localServices, setLocalServices] = useState(data);
  const [savingState, setSavingState] = useState<SavingState>({});

  React.useEffect(() => {
    setLocalServices(data);
  }, [data]);

  const handleFieldChange = (id: number, field: string, value: number) => {
    setLocalServices(prev =>
      prev.map(item => {
        if (item.id === id) {
          if (field.startsWith('score_')) {
            const index = parseInt(field.split('_')[1], 10);
            const newScores = [...item.scores];
            newScores[index] = value;
            return { ...item, scores: newScores };
          }
          if (field === 'revenue') {
            return { ...item, revenueEstimate: value };
          }
        }
        return item;
      })
    );
  };
  
  const handleUpdate = async (id: number, field: string) => {
    const serviceToUpdate = localServices.find(s => s.id === id);
    if (serviceToUpdate) {
        setSavingState(prev => ({...prev, [id]: {...prev[id], [field]: true}}));
        try {
            await onUpdateService(serviceToUpdate);
        } catch (error) {
            // Error is handled by context notification, just need to reset saving state
        } finally {
            setSavingState(prev => ({...prev, [id]: {...prev[id], [field]: false}}));
        }
    }
  };

  const handleStatusChange = async (id: number, status: ServiceStatus) => {
    const serviceToUpdate = localServices.find(s => s.id === id);
    if(serviceToUpdate) {
        const updatedService = { ...serviceToUpdate, status };
        setLocalServices(prev => prev.map(s => s.id === id ? updatedService : s));
        await onUpdateService(updatedService);
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Rank</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Ideia de Serviço</th>
            {criteriaData.map((criterion) => (
              <th key={criterion.id} className="px-2 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                <button
                  onClick={() => onHeaderClick(criterion)}
                  className="font-bold text-gray-600 uppercase tracking-wider hover:text-brand-dark-blue focus:outline-none focus:underline"
                  title={`Clique para ver detalhes sobre: ${criterion.title}`}
                >
                  {criterion.shortTitle}
                </button>
              </th>
            ))}
            <th className="px-2 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                <button
                    onClick={() => onHeaderClick(revenueCriterion)}
                    className="font-bold text-gray-600 uppercase tracking-wider hover:text-brand-dark-blue focus:outline-none focus:underline"
                    title={`Clique para ver detalhes sobre: ${revenueCriterion.title}`}
                >
                    {revenueCriterion.shortTitle}
                </button>
            </th>
            <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Total</th>
            <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Classificação</th>
            <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {localServices.map((item, index) => {
            const total = item.scores.reduce((acc, val) => acc + (val || 0), 0);
            const classification = getClassification(total);
            return (
              <tr key={item.id}>
                <td className="px-4 py-3 whitespace-nowrap text-center font-bold text-lg text-gray-700">{index + 1}</td>
                <td className="px-4 py-3 whitespace-nowrap"><div className="font-semibold text-gray-900">{item.service}</div><div className="text-xs text-gray-500">ID: {item.id}</div></td>
                {item.scores.map((score, i) => {
                    const fieldName = `score_${i}`;
                    const isSaving = savingState[item.id]?.[fieldName];
                    return (
                      <td key={i} className="px-2 py-3 whitespace-nowrap text-center">
                        <input
                          type="number"
                          min="0"
                          max="5"
                          value={score}
                          onChange={(e) => handleFieldChange(item.id, fieldName, Math.max(0, Math.min(5, Number(e.target.value))))}
                          onBlur={() => handleUpdate(item.id, fieldName)}
                          disabled={isSaving}
                          className={`w-14 text-center rounded-md border-gray-300 p-1 focus:border-brand-mid-blue focus:ring-brand-mid-blue ${isSaving ? 'bg-gray-200 animate-pulse' : ''}`}
                        />
                      </td>
                    )
                })}
                <td className="px-2 py-3 whitespace-nowrap text-center">
                    {(() => {
                        const fieldName = 'revenue';
                        const isSaving = savingState[item.id]?.[fieldName];
                        return (
                            <input
                                type="number"
                                min="0"
                                value={item.revenueEstimate || ''}
                                onChange={(e) => handleFieldChange(item.id, fieldName, Number(e.target.value))}
                                onBlur={() => handleUpdate(item.id, fieldName)}
                                disabled={isSaving}
                                className={`w-28 text-center rounded-md border-gray-300 p-1 focus:border-brand-mid-blue focus:ring-brand-mid-blue ${isSaving ? 'bg-gray-200 animate-pulse' : ''}`}
                                placeholder="R$"
                            />
                        )
                    })()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center font-bold text-lg text-gray-800">{total}</td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <span className={`py-1 px-3 rounded-full font-semibold text-xs uppercase ${classification.color}`}>{classification.text}</span>
                </td>
                <td className="px-2 py-3 whitespace-nowrap">
                  <select
                    value={item.status || 'avaliação'}
                    onChange={(e) => handleStatusChange(item.id, e.target.value as ServiceStatus)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-mid-blue focus:ring-brand-mid-blue sm:text-sm bg-white p-1"
                    style={{ minWidth: '120px' }}
                  >
                    <option value="avaliação">Avaliação</option>
                    <option value="aprovada">Aprovada</option>
                    <option value="cancelada">Cancelada</option>
                    <option value="finalizada">Finalizada</option>
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};


const PrioritizationSection = forwardRef<HTMLElement, PrioritizationSectionProps>((props, ref) => {
  const { services, updateService, downloadCSV, refreshData, applyAIRanking, isRanking, isRefreshing } = useServices();
  const [selectedCriterion, setSelectedCriterion] = useState<Criterion | null>(null);

  const combinedData = useMemo(() => {
    return services
      .map(service => {
        const total = service.scores.reduce((acc, val) => acc + val, 0);
        return { ...service, total };
      })
      .sort((a, b) => b.total - a.total);
  }, [services]);

  const handleHeaderClick = (criterion: Criterion) => {
    setSelectedCriterion(criterion);
  };

  const handleCloseModal = () => {
    setSelectedCriterion(null);
  };
  
  const isLoading = isRanking || isRefreshing;

  return (
    <Section
      ref={ref}
      id="prioritization"
      title="Priorização de Ideias com IA"
      subtitle="Utilize o poder da IA para analisar e classificar as ideias de serviço com base em critérios estratégicos. Clique nos cabeçalhos da tabela para entender cada critério."
    >
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
          <button onClick={refreshData} disabled={isLoading} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center gap-2 disabled:opacity-50">
            Sincronizar Dados
          </button>
          <button onClick={applyAIRanking} disabled={isLoading || services.length === 0} className="bg-gradient-to-br from-brand-dark-blue to-brand-mid-blue text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            Analisar com IA e Salvar
          </button>
          <button onClick={downloadCSV} disabled={services.length === 0} className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Baixar Planilha Completa
          </button>
        </div>
        
        {isRanking && <Loader text="A IA está avaliando as ideias. Isso pode levar um momento." />}
        {isRefreshing && <Loader text="Sincronizando com a base de dados..." />}
        
        {!isLoading && combinedData.length > 0 && (
          <RankingTable data={combinedData} onUpdateService={updateService} onHeaderClick={handleHeaderClick} />
        )}

        {!isLoading && services.length === 0 && (
             <p className="text-center text-gray-500 py-8">Nenhuma ideia para exibir. Adicione ideias na planilha ou no "Gerador de Ideias" e depois clique em "Sincronizar Dados" para atualizar.</p>
        )}
      </div>

      {selectedCriterion && (
        <Modal 
          isOpen={!!selectedCriterion} 
          onClose={handleCloseModal} 
          title={selectedCriterion.title}
        >
          <div className="space-y-4">
            <p className="text-gray-600 text-base">{selectedCriterion.description}</p>
            <h4 className="text-lg font-semibold text-gray-800 pt-2 border-t mt-4">Sub-critérios de Avaliação:</h4>
            <ul className="list-disc list-outside ml-5 space-y-2 text-gray-700">
              {selectedCriterion.subCriteria.map((sub, index) => (
                <li key={index}>{sub}</li>
              ))}
            </ul>
          </div>
        </Modal>
      )}
    </Section>
  );
});

export default PrioritizationSection;
