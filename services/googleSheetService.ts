import type { Service, AIGeneratedIdea, User } from '../types';

// TODO: Substitua pela URL real do seu Web App do Google Apps Script.
// Se esta URL não for alterada, o aplicativo usará dados de mock para demonstração.
export const WEB_APP_URL: string = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';

// --- Funções de Mock para demonstração ---
let mockServices: Service[] = [
    { id: 1, service: "Consultoria de Casa Inteligente", need: "Ajuda para escolher e instalar dispositivos de casa inteligente compatíveis.", cluster: "Casa Inteligente", businessModel: "Consultoria", targetAudience: "Proprietários de casas", status: "aprovada", creatorName: "Ana", creationDate: "2023-10-01T10:00:00Z", scores: [5, 4, 3, 5, 4], revenueEstimate: 150000 },
    { id: 2, service: "Plano de Suporte Técnico Premium", need: "Suporte técnico 24/7 para todos os eletrônicos da casa.", cluster: "Suporte Técnico", businessModel: "Assinatura/Recorrência", targetAudience: "Famílias com muitos dispositivos", status: "avaliação", creatorName: "Bruno", creationDate: "2023-10-02T11:30:00Z", scores: [4, 5, 5, 4, 3], revenueEstimate: 500000 },
    { id: 3, service: "Aluguel de Equipamentos de Realidade Virtual", need: "Acesso a equipamentos de VR de ponta para eventos ou uso casual.", cluster: "Acesso Flexível", businessModel: "Locação", targetAudience: "Gamers e planejadores de eventos", status: "avaliação", creatorName: "Carlos", creationDate: "2023-10-03T14:00:00Z", scores: [3, 4, 3, 4, 4], revenueEstimate: 80000 },
];
let nextId = mockServices.reduce((max, s) => Math.max(max, s.id), 0) + 1;

// Inicializa os usuários de mock com persistência no localStorage para uma melhor experiência de desenvolvimento.
const MOCK_USERS_DB_KEY = 'mock_users_db';
const initialMockUsers: (User & { passwordHash: string })[] = [
    { name: 'Usuário Mock', email: 'test@test.com', passwordHash: 'hashedpassword' }
];

let mockUsers: (User & { passwordHash: string })[];

try {
    const storedUsers = localStorage.getItem(MOCK_USERS_DB_KEY);
    if (storedUsers) {
        mockUsers = JSON.parse(storedUsers);
    } else {
        mockUsers = initialMockUsers;
        localStorage.setItem(MOCK_USERS_DB_KEY, JSON.stringify(mockUsers));
    }
} catch (e) {
    console.error("Não foi possível inicializar os usuários de mock do localStorage", e);
    mockUsers = initialMockUsers;
}


async function handleMockRequest(action: string, payload?: any): Promise<any> {
    return new Promise(resolve => {
        setTimeout(() => {
            try {
                switch (action) {
                    case 'registerUser': {
                        const { name, email } = payload;
                        if (mockUsers.find(u => u.email === email)) {
                            throw new Error("Usuário com este email já existe.");
                        }
                        const newUser = { name, email, passwordHash: 'hashedpassword' };
                        mockUsers.push(newUser);
                        // Persiste a lista de usuários atualizada
                        localStorage.setItem(MOCK_USERS_DB_KEY, JSON.stringify(mockUsers));
                        resolve({ success: true, data: { user: { name, email }, token: 'mock-token-for-' + email } });
                        break;
                    }
                    case 'loginUser': {
                        const { email } = payload;
                        const user = mockUsers.find(u => u.email === email);
                        if (user) { // Nenhuma verificação de senha no mock
                            resolve({ success: true, data: { user: { name: user.name, email: user.email }, token: 'mock-token-for-' + email } });
                        } else {
                            throw new Error("Credenciais inválidas.");
                        }
                        break;
                    }
                    case 'getServices':
                        resolve({ success: true, data: [...mockServices] });
                        break;
                    case 'addService': {
                        const newService: Service = { ...payload.service, id: nextId++, creationDate: new Date().toISOString(), scores: Array(5).fill(0), revenueEstimate: 0 };
                        mockServices.push(newService);
                        resolve({ success: true, data: newService });
                        break;
                    }
                    case 'updateService': {
                        const index = mockServices.findIndex(s => s.id === payload.service.id);
                        if (index > -1) { mockServices[index] = { ...mockServices[index], ...payload.service }; resolve({ success: true, data: mockServices[index] }); } 
                        else { throw new Error(`Serviço com id ${payload.service.id} não encontrado.`); }
                        break;
                    }
                    case 'bulkUpdateServices': {
                         payload.services.forEach((serviceData: Service) => {
                            const index = mockServices.findIndex(s => s.id === serviceData.id);
                            if (index > -1) mockServices[index] = { ...mockServices[index], ...serviceData };
                        });
                        resolve({ success: true, data: { updatedCount: payload.services.length } });
                        break;
                    }
                    case 'deleteService': {
                        mockServices = mockServices.filter(s => s.id !== payload.id);
                        resolve({ success: true, data: { id: payload.id } });
                        break;
                    }
                    case 'getAIGeneratedIdeaDetails': {
                        resolve({ success: true, data: { beneficio: `Benefício simulado para "${payload.idea}"`, publico: "Público-alvo simulado", modelo: "Assinatura/Recorrência" } });
                        break;
                    }
                    case 'getAIRanking': {
                        const rankedServices = payload.services.map((s: Service) => ({ id: s.id, scores: Array.from({length: 5}, () => Math.floor(Math.random() * 6)) }));
                        resolve({ success: true, data: rankedServices });
                        break;
                    }
                    case 'getAIInsight': {
                        resolve({ success: true, data: { text: `Esta é uma **análise simulada** sobre sua pergunta.`, groundingChunks: [] } });
                        break;
                    }
                    default:
                        throw new Error(`Ação de mock desconhecida: ${action}`);
                }
            } catch (e: any) {
                console.error("Mock API Error:", e);
                resolve({ success: false, error: e.message });
            }
        }, 300 + Math.random() * 400);
    });
}


export async function apiRequest<T>(action: string, payload?: object): Promise<T> {
    if (WEB_APP_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE' || !WEB_APP_URL) {
        const mockResponse = await handleMockRequest(action, payload);
        if (mockResponse.success) return mockResponse.data as T;
        throw new Error(mockResponse.error || 'Ocorreu um erro no mock da API.');
    }

    const sessionStr = localStorage.getItem('session');
    const token = sessionStr ? JSON.parse(sessionStr).token : null;
    // FIX: Changed type of requestPayload to `any` to allow adding sessionToken property.
    const requestPayload: any = { ...payload };

    if (action !== 'loginUser' && action !== 'registerUser') {
      if (!token) {
        throw new Error("Tentativa de chamada de API protegida sem autenticação.");
      }
      requestPayload.sessionToken = token;
    }

    try {
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'cors',
            redirect: 'follow',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action, payload: requestPayload }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro na API: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();
        if (result.success === false) {
            throw new Error(result.error || 'Ocorreu um erro desconhecido na API.');
        }
        return result.data as T;

    } catch (error: any) {
        console.error(`Falha na ação "${action}":`, error);
        throw new Error(`Não foi possível se comunicar com o servidor. Verifique sua conexão. Detalhes: ${error.message}`);
    }
}


// --- Funções de Serviço ---

interface AuthResponse {
  user: User;
  token: string;
}

export const loginUser = (email: string, password: string): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('loginUser', { email, password });
};

export const registerUser = (name: string, email: string, password: string): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('registerUser', { name, email, password });
};

const serviceToSheetData = (service: Partial<Service>) => ({
    id: service.id,
    service: service.service,
    need: service.need,
    cluster: service.cluster,
    businessModel: service.businessModel,
    targetAudience: service.targetAudience || '',
    status: service.status || 'avaliação',
    creatorName: service.creatorName || '',
    creationDate: service.creationDate || '',
    score_alinhamento: service.scores?.[0] ?? 0,
    score_valor_cliente: service.scores?.[1] ?? 0,
    score_impacto_fin: service.scores?.[2] ?? 0,
    score_viabilidade: service.scores?.[3] ?? 0,
    score_vantagem_comp: service.scores?.[4] ?? 0,
    revenue_estimate: service.revenueEstimate ?? 0,
});

export const getServices = (): Promise<Service[]> => apiRequest<Service[]>('getServices');
export const addServiceToSheet = (service: Omit<Service, 'id' | 'creationDate' | 'scores' | 'revenueEstimate'>): Promise<Service> => apiRequest<Service>('addService', { service });
export const updateServiceInSheet = (service: Service): Promise<Service> => apiRequest<Service>('updateService', { service: serviceToSheetData(service) });
export const bulkUpdateServicesInSheet = (services: Service[]): Promise<{ updatedCount: number }> => apiRequest<{ updatedCount: number }>('bulkUpdateServices', { services: services.map(serviceToSheetData) });
export const deleteServiceFromSheet = (id: number): Promise<{ id: number }> => apiRequest<{ id: number }>('deleteService', { id });