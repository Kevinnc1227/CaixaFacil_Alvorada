/**
 * ThemeContext — CaixaFacil Design System
 * Suporta múltiplos temas com persistência via localStorage.
 * Para adicionar um novo tema: basta criar uma entrada em THEMES
 * e adicionar os tokens correspondentes em design-system.css.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';

// ─── Theme Definitions ───────────────────────────────────────────────────────
export type ThemeId =
    | 'amber-dark'    // padrão — âmbar/charcoal (brutalismo elegante)
    | 'amber-light'   // âmbar/branco — para ambientes bem iluminados
    | 'ocean-dark'    // azul celeste/escuro — clean SaaS
    | 'rose-dark'     // rosa/preto — para quem quer personalidade
    | 'emerald-dark'; // verde esmeralda — natureza e frescor

export interface ThemeConfig {
    id: ThemeId;
    label: string;
    description: string;
    preview: { bg: string; accent: string; text: string };
}

export const THEMES: ThemeConfig[] = [
    {
        id: 'amber-dark',
        label: 'Âmbar · Escuro',
        description: 'O tema padrão. Brutalismo elegante com tons âmbar e carvão.',
        preview: { bg: '#0a0a0a', accent: '#d4a853', text: '#f5f0eb' },
    },
    {
        id: 'amber-light',
        label: 'Âmbar · Claro',
        description: 'Versão clara do tema padrão para ambientes iluminados.',
        preview: { bg: '#f5f0eb', accent: '#b8923f', text: '#111111' },
    },
    {
        id: 'ocean-dark',
        label: 'Oceano · Escuro',
        description: 'Azul profissional para um look SaaS moderno.',
        preview: { bg: '#030712', accent: '#38bdf8', text: '#f0f9ff' },
    },
    {
        id: 'rose-dark',
        label: 'Rosa · Escuro',
        description: 'Rosa bold para quem quer diferenciação.',
        preview: { bg: '#0f0a0f', accent: '#f472b6', text: '#fdf2f8' },
    },
    {
        id: 'emerald-dark',
        label: 'Esmeralda · Escuro',
        description: 'Verde esmeralda para um visual fresco e natural.',
        preview: { bg: '#030f0a', accent: '#34d399', text: '#ecfdf5' },
    },
];

// ─── Context ─────────────────────────────────────────────────────────────────
interface ThemeContextValue {
    theme: ThemeId;
    themeConfig: ThemeConfig;
    setTheme: (id: ThemeId) => void;
    themes: ThemeConfig[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'caixafacil_theme';
const DEFAULT_THEME: ThemeId = 'amber-dark';

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<ThemeId>(() => {
        const stored = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
        return stored && THEMES.find(t => t.id === stored) ? stored : DEFAULT_THEME;
    });

    // Apply theme data-attribute to <html> so CSS variables cascade
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const setTheme = (id: ThemeId) => {
        if (!THEMES.find(t => t.id === id)) return;
        setThemeState(id);
        localStorage.setItem(STORAGE_KEY, id);
    };

    const themeConfig = THEMES.find(t => t.id === theme) ?? THEMES[0];

    return (
        <ThemeContext.Provider value={{ theme, themeConfig, setTheme, themes: THEMES }}>
            {children}
        </ThemeContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useTheme(): ThemeContextValue {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
    return ctx;
}
