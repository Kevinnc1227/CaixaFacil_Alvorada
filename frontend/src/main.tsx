import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeContext'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <App />
        <Toaster position="top-right" toastOptions={{ className: 'font-sans text-sm bg-cf-surface text-cf-text border border-cf-border', duration: 4000 }} />
      </ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
      <Toaster position="top-right" toastOptions={{ className: 'font-lexend text-sm' }} />
    </QueryClientProvider>
  </StrictMode>,
)
