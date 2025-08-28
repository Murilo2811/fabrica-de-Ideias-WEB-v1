import React, { forwardRef } from 'react';
import Section from './Section';
import { clusterData } from '../data/clusterData';

interface ClusterAnalysisSectionProps {
  highlightedClusterId?: string | null;
}

const ClusterCard: React.FC<{ title: string; valor: string; necessidades: string[] }> = ({ title, valor, necessidades }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col h-full">
    <h3 className="text-2xl font-bold text-brand-dark-blue mb-3">{title}</h3>
    <p className="text-gray-600 mb-4 flex-grow">
      <strong>Proposta de Valor:</strong> {valor}
    </p>
    <div className="mt-auto">
      <h4 className="text-lg font-semibold text-gray-700 mb-2">Necessidades Principais:</h4>
      <ul className="list-disc ml-6 text-gray-600 space-y-1">
        {necessidades.map((need, index) => <li key={index}>{need}</li>)}
      </ul>
    </div>
  </div>
);

const ClusterAnalysisSection = forwardRef<HTMLElement, ClusterAnalysisSectionProps>(({ highlightedClusterId }, ref) => {
  return (
    <Section ref={ref} id="clusterAnalysis" title="Análise dos Clusters Estratégicos">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {clusterData.map(cluster => {
            const isHighlighted = highlightedClusterId === cluster.id;
            const cardWrapperClasses = `
              rounded-xl transition-all duration-300
              ${isHighlighted 
                ? 'scale-105 ring-4 ring-brand-primary-yellow ring-offset-4 ring-offset-gray-100 shadow-2xl' 
                : 'hover:scale-105'}
            `;
            return (
              <div id={`cluster-card-${cluster.id}`} key={cluster.id} className={cardWrapperClasses}>
                <ClusterCard {...cluster} />
              </div>
            );
        })}
      </div>
    </Section>
  );
});

export default ClusterAnalysisSection;