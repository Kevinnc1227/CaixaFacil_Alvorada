import axios from 'axios';

// Instância principal para rotas protegidas (/api)
export const api = axios.create({
    baseURL: 'http://localhost:3001/api',
    timeout: 10000,
});

// Instância para rotas públicas (ex: /auth)
export const authApi = axios.create({
    baseURL: 'http://localhost:3001/auth',
    timeout: 10000,
});

// Interceptor para injetar o JWT automaticamente
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('alvorada_jwt');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
