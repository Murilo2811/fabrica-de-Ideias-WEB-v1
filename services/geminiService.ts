import type { Service, AIGeneratedIdea, GroundingChunk } from '../types';
import { businessModelCategories } from "../utils/businessModelMapper";
import { apiRequest } from './googleSheetService'; // A função de request agora é central

export const getAIGeneratedIdeaDetails = async (idea: string): Promise<AIGeneratedIdea> => {
  const criteriaSummary = `
      1.  **Valor para o Cliente:** A ideia deve resolver dores reais, criar encantamento e ser relevante.
      2.  **Impacto no Faturamento:** A ideia deve ter potencial de receita recorrente, aumentar o valor das transações e ser rentável.
      3.  **Alinhamento com a Marca Fast Shop:** A ideia deve ser premium, inovadora e facilitar a vida do cliente.
  `;
  
  return apiRequest<AIGeneratedIdea>('getAIGeneratedIdeaDetails', {
    idea,
    criteriaSummary,
    businessModelCategories
  });
};


export const getAIRanking = async (services: Service[]): Promise<{ id: number; scores: number[]; }[]> => {
    const criteria = `
1.  **Alinhamento Estratégico e Propósito da Marca (Peso Alto):**
    *   **Conexão com a Missão e Visão:** A ideia contribui para "Encantar e Cuidar dos Clientes, Colaboradores e do Planeta por toda a vida" e para "Conquistar 1MM de Fãs"?
    *   **Posicionamento Premium:** O serviço reforça a imagem da Fast Shop como "a marca mais desejada" e "referência em experiência premium no varejo"?
    *   **Facilitação da Vida Diária:** A proposta realmente "facilita a vida das pessoas no dia a dia (mais fácil, mais divertido e ganhar tempo)", conforme a necessidade central dos clientes?
    *   **Inovação e Pioneirismo:** O serviço tem potencial para ser algo "lançado primeiro e bem feito" pela Fast Shop, demonstrando "Inovação" e "Curadoria" da marca?

2.  **Potencial de Geração de Valor para o Cliente (Peso Alto):**
    *   **Resolução de Dores Reais:** Quão eficaz a ideia é em resolver uma ou mais das dores críticas e recorrentes expressas pelos clientes na pesquisa (ex: problemas com logística, atendimento pós-venda, inconsistência de preço, complexidade de uso)?
    *   **Criação de "Ganhos" e Encantamento:** O serviço oferece benefícios claros e tangíveis que superam as expectativas, transformando clientes em "fãs" e gerando uma experiência memorável?
    *   **Personalização e Relevância:** A solução pode ser adaptada para atender às necessidades individuais dos clientes, entregando "soluções personalizadas" e fortalecendo o relacionamento?

3.  **Potencial de Impacto no Faturamento e Rentabilidade (Peso Alto):**
    *   **Contribuição para a Meta de R$ 1 Bilhão em Serviços:** Qual a projeção de receita direta que este serviço pode gerar para a área de serviços até 2028?
    *   **Geração de Receita Recorrente:** O modelo de negócio do serviço permite a criação de um fluxo de receita previsível e contínuo (assinaturas, mensalidades), aumentando o Lifetime Value (LTV) do cliente?
    *   **Impacto no Ticket Médio e Vendas Adicionais:** O serviço tem potencial para aumentar o valor médio das transações ou impulsionar o cross-sell/upsell de outros produtos e serviços da Fast Shop?
    *   **Rentabilidade e Eficiência:** O serviço possui uma margem de lucro atrativa e pode ser operado de forma eficiente, contribuindo para a "melhoria da margem operacional"?

4.  **Viabilidade e Capacidade de Execução (Peso Médio):**
    *   **Complexidade de Implementação:** Qual o nível de dificuldade (tecnológica, operacional, cultural) para desenvolver e integrar o serviço à operação atual da Fast Shop?
    *   **Recursos Necessários:** A Fast Shop possui internamente (ou pode adquirir/parceirar de forma eficiente) o capital, a tecnologia, as ferramentas e os talentos humanos necessários para o lançamento e a sustentação do serviço?
    *   **Tempo para o Mercado (Time to Market):** Qual a agilidade possível para lançar o serviço (mesmo que em fase piloto) e começar a gerar valor e aprendizado?

5.  **Diferenciação e Vantagem Competitiva (Peso Médio):**
    *   **Caráter Inovador e Exclusividade:** O serviço oferece algo verdadeiramente novo ou significativamente melhor do que o que já existe no mercado, conferindo uma vantagem competitiva clara à Fast Shop?
    *   **Alavancagem dos Atributos da Marca:** O serviço capitaliza os pontos fortes da Fast Shop, como a "Confiança", "Curadoria", "Atendimento e experiência em todos os pontos de contato" e a "Integração Omnichannel", de maneira que os concorrentes teriam dificuldade em replicar?
    *   **Defensibilidade no Mercado:** O serviço cria barreiras de entrada para a concorrência, protegendo a posição da Fast Shop como líder?
`;
    return apiRequest<{ id: number; scores: number[]; }[]>('getAIRanking', { services, criteria });
};

export const getAIInsight = async (userQuery: string, services: Service[]): Promise<{text: string; groundingChunks: GroundingChunk[]}> => {
  return apiRequest<{text: string; groundingChunks: GroundingChunk[]}>('getAIInsight', { userQuery, services });
};
