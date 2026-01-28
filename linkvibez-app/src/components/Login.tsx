import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../supabaseClient';

const Login = () => {
  return (
    <div className="login-page flex flex-col items-center justify-center min-h-screen px-6">
      <div className="auth-card w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          {/* Your New Premium Logo */}
          <img 
            src="/logo.png" 
            alt="LinkVibez Logo" 
            className="ai-icon w-24 h-24 mb-4 object-contain" 
          />
          
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">LinkVibez</h1>
          <p className="text-purple-400 text-[10px] uppercase tracking-[0.4em] font-bold opacity-80">
            AI Dating Redefined ✨
          </p>
        </div>

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#8b5cf6',
                  brandAccent: '#a78bfa',
                  inputBackground: 'rgba(255, 255, 255, 0.05)',
                  inputText: 'white',
                  inputPlaceholder: '#94a3b8',
                },
              },
            },
          }}
          providers={['google']}
        />
      </div>
    </div>
  );
};

export default Login;