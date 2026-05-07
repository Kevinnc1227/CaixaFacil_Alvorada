import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type User = {
    id: number;
    nome: string;
    email: string;
    perfil: 'OPERADOR' | 'ADMINISTRADOR' | 'SUPORTE';
};

interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('alvorada_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Failed to parse stored user:', error);
            }
        }
    }, []);

    const logout = () => {
        localStorage.removeItem('alvorada_jwt');
        localStorage.removeItem('alvorada_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
