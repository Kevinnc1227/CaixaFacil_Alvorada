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

// Injeta o token JWT em todas as requisições autenticadas
api.interceptors.request.use((config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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
