import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Chaves padronizadas — fim da inconsistência caixafacil_jwt vs alvorada_jwt
export const STORAGE_KEYS = {
    TOKEN: 'khub_jwt',
    USER: 'khub_user',
} as const;

// Injeta o token JWT em todas as requisições autenticadas e garante o prefixo /api
api.interceptors.request.use((config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Garante que a requisição vá para /api se não for auth e não tiver o prefixo já
    if (config.url && !config.url.startsWith('/api') && !config.url.startsWith('/auth')) {
        config.url = `/api${config.url.startsWith('/') ? '' : '/'}${config.url}`;
    }
    
    return config;
});

// Redireciona para /login se o token expirar
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

// Eu exporto também como named export para compatibilidade com
// os módulos do origin/main que fazem `import { api } from '../api/api'`
export { api };
