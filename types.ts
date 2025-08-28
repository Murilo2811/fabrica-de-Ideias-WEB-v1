
export interface User {
  name: string;
  email: string;
}

export type ServiceStatus = 'avaliação' | 'aprovada' | 'cancelada' | 'finalizada';

export interface Service {
  id: number;
  service: string;
  need: string;
  cluster: string;
  businessModel: string;
  targetAudience?: string;
  status?: ServiceStatus;
  creatorName?: string;
  creationDate?: string;
  // Propriedades do Ranking unificadas
  scores: number[];
  revenueEstimate?: number;
}

export interface AIGeneratedIdea {
  beneficio: string;
  publico: string;
  modelo: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  };
}