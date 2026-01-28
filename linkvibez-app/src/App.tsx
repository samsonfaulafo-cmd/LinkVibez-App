import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import Login from './components/Login';
import SwipeCard from './components/SwipeCard';
import Matches from './components/Matches';
import Onboarding from './components/Onboarding'; // Import the new component

function App() {
  const [session, setSession] = useState<any>(null);
  const [view, setView] = useState<'swipe' | 'matches' | 'onboarding'>('swipe');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Handle Auth Session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) checkProfile(session.user.id);
      else setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Check if the user has completed their profile
  const checkProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (error || !data) {
      setView('onboarding');
    } else {
      setView('swipe');
    }
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white italic">LINKVIBEZ...</div>;

  if (!session) return <Login />;

  return (
    <div className="max-w-md mx-auto min-h-screen shadow-2xl bg-black relative">
      {view === 'onboarding' && (
        <Onboarding onComplete={() => setView('swipe')} />
      )}

      {view === 'swipe' && (
        <>
          <SwipeCard />
          <div className="fixed bottom-10 left-0 right-0 flex justify-center z-50">
            <button 
              onClick={() => setView('matches')}
              className="bg-white/10 backdrop-blur-md border border-white/20 px-8 py-3 rounded-full text-white text-[10px] font-black tracking-[0.3em] uppercase hover:bg-white/20 transition-all shadow-2xl"
              style={{ pointerEvents: 'auto' }}
            >
              View Matches ✨
            </button>
          </div>
        </>
      )}

      {view === 'matches' && (
        <Matches onBack={() => setView('swipe')} />
      )}
    </div>
  );
}

export default App;