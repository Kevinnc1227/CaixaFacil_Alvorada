import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// Aqui eu defino o molde do meu usuário. Assim o TypeScript para de reclamar 
// e eu sei exatamente quais propriedades eu tenho disponíveis no sistema inteiro.
export type User = {
    id: number;
    nome: string;
    email: string;
    perfil: 'OPERADOR' | 'ADMINISTRADOR' | 'SUPORTE';
};

// Aqui eu digo pro Contexto o que ele vai guardar: o usuário atual, 
// a função de atualizar esse usuário e a função de deslogar (jogar tudo fora).
interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Esse é o cara que vai abraçar a nossa aplicação e prover o usuário logado pras outras telas.
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // Começo com null porque, a princípio, não tem ninguém logado até eu conferir.
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Assim que o app carrega, eu dou uma espiada no localStorage pra ver se já tem 
        // um usuário salvo de sessões anteriores usando a nossa chave padrão 'khub_user'.
        const storedUser = localStorage.getItem('khub_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Puts, deu ruim ao tentar ler o usuário salvo:', error);
            }
        }
    }, []);

    const logout = () => {
        // Quando o usuário sai, eu limpo tudo pra garantir segurança total. 
        // Sem token, sem dados locais, e zero a sessão atual.
        localStorage.removeItem('khub_jwt');
        localStorage.removeItem('khub_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Esse hook personalizado é a minha forma de facilitar a vida. 
// Ao invés de ficar chamando useContext e AuthContext toda hora, eu só uso useAuth() e pronto.
export const useAuth = () => {
    const context = useContext(AuthContext);
    // Dou essa checada aqui pra evitar usar o useAuth fora do Provider, senão a aplicação quebra feio.
    if (context === undefined) {
        throw new Error('O useAuth tem que ser usado dentro do AuthProvider, senão não funciona!');
    }
    return context;
};

