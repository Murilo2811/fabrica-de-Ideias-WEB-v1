
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { Service, AIGeneratedIdea, GroundingChunk } from '../types';
import { businessModelCategories } from "../utils/businessModelMapper";
import { clusterData } from '../data/clusterData';

if (!process.env.API_KEY) {
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const getAIGeneratedIdeaDetails = async (idea: string): Promise<AIGeneratedIdea> => {
  const criteriaSummary = `
      1.  **Valor para o Cliente:** A ideia deve resolver dores reais, criar encantamento e ser relevante.
      2.  **Impacto no Faturamento:** A ideia deve ter potencial de receita recorrente, aumentar o valor das transações e ser rentável.
      3.  **Alinhamento com a Marca Fast Shop:** A ideia deve ser premium, inovadora e facilitar a vida do cliente.
  `;
  const prompt = `
      Aja como um "Consultor de Inovação e Estratégia de Negócios" da Fast Shop. Sua tarefa é analisar uma nova ideia de serviço e refiná-la com base nos seguintes critérios estratégicos da empresa:
      ${criteriaSummary}

      Para a ideia de serviço fornecida, gere três sugestões concisas e orientadas para o mercado.

      Ideia de Serviço: "${idea}"

      Responda APENAS com um objeto JSON válido.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          beneficio: {
            type: Type.STRING,
            description: "Descreva o benefício principal para o cliente, focando em como a ideia resolve uma dor real e cria valor (Critério 1).",
          },
          publico: {
            type: Type.STRING,
            description: "Identifique o público-alvo mais relevante para esta oferta premium.",
          },
          modelo: {
            type: Type.STRING,
            enum: businessModelCategories,
            description: `Escolha o modelo de negócio MAIS APROPRIADO da lista, pensando no potencial de faturamento e rentabilidade (Critério 2).`,
          },
        },
        required: ["beneficio", "publico", "modelo"]
      }
    }
  });

  const jsonText = response.text.trim();
  return JSON.parse(jsonText);
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
    const prompt = `Você é um analista de negócios sênior da Fast Shop. Sua tarefa é analisar e priorizar uma lista de novas ideias de serviço. Para cada ideia, você deve:
1. Atribuir uma nota de 0 a 5 para cada um dos 5 critérios de priorização a seguir.

Seja rigoroso e consistente em sua avaliação.\n\n# Critérios de Priorização:\n${criteria}\n\n# Lista de Ideias de Serviço (JSON):\n${JSON.stringify(services.map(s => ({id: s.id, service: s.service, need: s.need, cluster: s.cluster})))}\n\n# Formato da Resposta:\nResponda APENAS com um array JSON válido.`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.INTEGER },
                        scores: {
                            type: Type.ARRAY,
                            items: { type: Type.INTEGER, minimum: 0, maximum: 5 }
                        }
                    },
                    required: ["id", "scores"]
                }
            }
        }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
};

export const getAIInsight = async (userQuery: string, services: Service[]): Promise<{text: string; groundingChunks: GroundingChunk[]}> => {
  const context = JSON.stringify(services.slice(0, 15)); // Limit context to avoid overly large prompts
  const prompt = `Você é um assistente de IA especialista em análise de negócios e portfólio de serviços. Responda à pergunta do usuário com base nos dados fornecidos e no seu conhecimento geral sobre estratégia de negócios. Se a pergunta for sobre informações atuais ou tendências de mercado, use a busca para fundamentar sua resposta. Formate sua resposta usando Markdown (use **negrito** para destacar termos importantes e listas com * ou - quando apropriado). Seja conciso e direto.\n\n# Dados do Portfólio (Amostra):\n${context}\n\n# Pergunta do Usuário:\n"${userQuery}"`;

  const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        tools: [{googleSearch: {}}],
      }
  });

  const text = response.text;
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  return { text, groundingChunks: groundingChunks as GroundingChunk[] };
};
