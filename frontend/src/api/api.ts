import axios from 'axios';

// Aqui eu defino onde o meu backend tá rodando. 
// No futuro, se a gente for pra produção, é só trocar essa URL.
const API_BASE_URL = 'http://localhost:3001';

// Crio uma instância única do axios. Desse jeito, eu não preciso ficar 
// passando a URL base em toda requisição que eu fizer no app.
const api = axios.create({
    baseURL: API_BASE_URL,
});

// Padronizei essas chaves aqui pra acabar com a bagunça de ter nomes diferentes.
// Uso essas constantes no app todo pra evitar erro de digitação.
export const STORAGE_KEYS = {
    TOKEN: 'khub_jwt',
    USER: 'khub_user',
} as const;

// Esse cara aqui é o meu "fiscal de saída" (Request Interceptor).
// Antes de qualquer requisição sair do front pro back, ele dá uma olhada.
api.interceptors.request.use((config) => {
    // Pego o token JWT que tá guardado no navegador.
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    
    // Se o cara tiver logado (tiver token), eu enfio o token no cabeçalho.
    // É assim que o backend sabe quem tá fazendo a requisição.
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Garanto que a requisição vá pro lugar certo (rotas /api) se já não tiver o prefixo.
    // Ignoro as rotas de '/auth' porque elas são públicas.
    if (config.url && !config.url.startsWith('/api') && !config.url.startsWith('/auth')) {
        config.url = `/api${config.url.startsWith('/') ? '' : '/'}${config.url}`;
    }
    
    return config;
});

// Agora esse é o meu "fiscal de chegada" (Response Interceptor).
// Se der algum erro na volta da requisição, ele é o primeiro a saber.
api.interceptors.response.use(
    (response) => response, // Se deu bom, só deixa passar.
    (error) => {
        // Se o erro for 401 (Não autorizado), significa que o token do cara venceu ou ele tentou bancar o espertinho.
        if (error.response?.status === 401) {
            // Limpo a sujeira toda pra não deixar sessão fantasma.
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);
            // Chuto o cara de volta pra tela de login.
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

// Eu exporto também como named export para facilitar compatibilidade com
// alguns módulos do app que fazem `import { api } from '../api/api'`.
export { api };
