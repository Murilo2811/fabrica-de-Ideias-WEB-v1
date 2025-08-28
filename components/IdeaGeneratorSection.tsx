
import React, { useState, useMemo, forwardRef } from 'react';
import type { Service, AIGeneratedIdea } from '../types';
import { getAIGeneratedIdeaDetails } from '../services/geminiService';
import { businessModelCategories } from '../utils/businessModelMapper';
import { useServices } from '../contexts/ServicesContext';
import Section from './Section';
import Loader from './Loader';

interface IdeaGeneratorSectionProps {}

const IdeaGeneratorSection = forwardRef<HTMLElement, IdeaGeneratorSectionProps>((props, ref) => {
  const { services, addService } = useServices();
  const [ideaInput, setIdeaInput] = useState('');
  const [generatedDetails, setGeneratedDetails] = useState<AIGeneratedIdea | null>(null);
  const [cluster, setCluster] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const uniqueClusters = useMemo(() => [...new Set(services.map(s => s.cluster).filter(Boolean))].sort(), [services]);

  const handleAnalyzeIdea = async () => {
    if (!ideaInput.trim()) {
      setError('Por favor, insira uma ideia de serviço.');
      return;
    }
    setError('');
    setIsLoading(true);
    setGeneratedDetails(null);

    try {
      const result = await getAIGeneratedIdeaDetails(ideaInput);
      setGeneratedDetails(result);
      if (!cluster && uniqueClusters.length > 0) {
        setCluster(uniqueClusters[0]);
      }
    } catch (err) {
      console.error("Error generating idea details:", err);
      setError('Ocorreu um erro ao analisar a ideia. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddIdea = async () => {
    if (!generatedDetails || !ideaInput.trim() || !cluster) {
      setError('Todos os campos devem ser preenchidos para adicionar a ideia.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
        const newService: Omit<Service, 'id' | 'creationDate' | 'scores' | 'revenueEstimate'> = {
          service: ideaInput.trim(),
          need: generatedDetails.beneficio,
          targetAudience: generatedDetails.publico,
          businessModel: generatedDetails.modelo,
          cluster: cluster,
          status: 'avaliação',
          creatorName: creatorName.trim(),
        };
        await addService(newService);

        // Reset form
        setIdeaInput('');
        setGeneratedDetails(null);
        setCluster('');
        setCreatorName('');
        setError('');
    } catch (err) {
        console.error("Error adding new service:", err);
        setError('Falha ao adicionar a ideia. Verifique a conexão e tente novamente.');
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Section
      ref={ref}
      id="ideaGenerator"
      title="Gerador de Ideias de Serviço"
      subtitle="Refine e organize suas ideias de negócio com a ajuda de um consultor de inovação e estratégia de negócios de IA."
    >
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg max-w-4xl mx-auto">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="idea-input" className="block text-sm font-medium text-gray-700">1. Insira sua ideia de serviço em uma frase:</label>
            <textarea
              id="idea-input"
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-mid-blue focus:ring-brand-mid-blue sm:text-sm bg-white"
              placeholder="Ex: Manutenção de drones para agricultura"
              value={ideaInput}
              onChange={(e) => setIdeaInput(e.target.value)}
            />
          </div>

          <div className="text-center">
            <button
              onClick={handleAnalyzeIdea}
              disabled={isLoading || isSubmitting}
              className="bg-gradient-to-br from-brand-dark-blue to-brand-mid-blue text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
              {isLoading ? 'Analisando...' : 'Analisar Ideia'}
            </button>
          </div>
          
          {isLoading && <Loader text="Consultor de IA analisando... por favor, aguarde." />}
          
          {generatedDetails && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              <div>
                <label htmlFor="beneficio-output" className="block text-sm font-medium text-gray-700">2. Benefício Principal (Editável):</label>
                <textarea
                  id="beneficio-output"
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-mid-blue focus:ring-brand-mid-blue sm:text-sm bg-white"
                  value={generatedDetails.beneficio}
                  onChange={(e) => setGeneratedDetails({ ...generatedDetails, beneficio: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="publico-output" className="block text-sm font-medium text-gray-700">3. Público-Alvo (Editável):</label>
                <textarea
                  id="publico-output"
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-mid-blue focus:ring-brand-mid-blue sm:text-sm bg-white"
                  value={generatedDetails.publico}
                  onChange={(e) => setGeneratedDetails({ ...generatedDetails, publico: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="modelo-output" className="block text-sm font-medium text-gray-700">4. Modelo de Negócio (Sugestão):</label>
                <select id="modelo-output" value={generatedDetails.modelo} onChange={(e) => setGeneratedDetails({...generatedDetails, modelo: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-mid-blue focus:ring-brand-mid-blue sm:text-sm bg-white">
                  {businessModelCategories.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="cluster-select" className="block text-sm font-medium text-gray-700">5. Classifique no Cluster:</label>
                <select id="cluster-select" value={cluster} onChange={(e) => setCluster(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-mid-blue focus:ring-brand-mid-blue sm:text-sm bg-white" required>
                  <option value="" disabled>Selecione um cluster</option>
                  {uniqueClusters.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="creator-name" className="block text-sm font-medium text-gray-700">6. Nome do Criador (Opcional):</label>
                <input
                  id="creator-name"
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-mid-blue focus:ring-brand-mid-blue sm:text-sm bg-white"
                  placeholder="Ex: João Silva"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                />
              </div>
              <div className="md:col-span-2 text-center">
                <button
                  onClick={handleAddIdea}
                  disabled={isSubmitting || isLoading}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-wait"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  {isSubmitting ? 'Adicionando...' : 'Adicionar à Base'}
                </button>
              </div>
            </div>
          )}
           {error && <p className="text-red-600 font-semibold mt-4 text-center animate-fade-in">{error}</p>}
        </div>
      </div>
    </Section>
  );
});

export default IdeaGeneratorSection;
