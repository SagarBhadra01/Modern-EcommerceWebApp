import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import './styles/globals.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        variables: {
          colorPrimary: '#ffffff',
          colorBackground: '#0A0A0A',
          colorText: '#ffffff',
          colorTextSecondary: 'rgba(255,255,255,0.5)',
          colorInputBackground: '#050505',
          colorInputText: '#ffffff',
          borderRadius: '0.75rem',
        },
        elements: {
          card: 'bg-[#0A0A0A] border border-white/[0.08] shadow-2xl',
          headerTitle: 'text-white',
          headerSubtitle: 'text-white/50',
          socialButtonsBlockButton: 'bg-[#050505] border-white/[0.08] text-white hover:bg-white/5',
          formFieldLabel: 'text-white/70',
          formFieldInput: 'bg-[#050505] border-white/[0.08] text-white',
          footerActionLink: 'text-white hover:text-white/80',
          formButtonPrimary: 'bg-white text-black hover:bg-white/90',
          dividerLine: 'bg-white/[0.08]',
          dividerText: 'text-white/40',
          identityPreview: 'bg-[#050505] border-white/[0.08]',
          identityPreviewText: 'text-white',
          identityPreviewEditButton: 'text-white/50 hover:text-white',
          formFieldInputShowPasswordButton: 'text-white/30 hover:text-white',
          alert: 'bg-[#050505] border-white/[0.08]',
          alertText: 'text-white/70',
          userButtonPopoverCard: 'bg-[#0A0A0A] border border-white/[0.08]',
          userButtonPopoverActionButton: 'text-white/70 hover:bg-white/5',
          userButtonPopoverActionButtonText: 'text-white/70',
          userButtonPopoverFooter: 'border-white/[0.08]',
          userPreviewMainIdentifier: 'text-white',
          userPreviewSecondaryIdentifier: 'text-white/40',
        },
      }}
    >
      <App />
    </ClerkProvider>
  </StrictMode>
);
