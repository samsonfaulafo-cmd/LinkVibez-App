import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import Chat from './Chat'; // Import the chat component

const Matches = ({ onBack }: { onBack: () => void }) => {
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch people you have liked
        const { data } = await supabase
          .from('likes')
          .select('target_id, profiles(*)')
          .eq('user_id', user.id)
          .eq('is_like', true);
        
        if (data) setMatches(data.map(m => m.profiles));
      }
    };
    fetchMatches();
  }, []);

  // If a match is selected, show the Chat screen instead of the list
  if (selectedMatchId) {
    return <Chat matchId={selectedMatchId} onBack={() => setSelectedMatchId(null)} />;
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="flex items-center mb-10">
        <button onClick={onBack} className="text-purple-500 font-black mr-4 uppercase tracking-tighter italic">← Back</button>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">Your Matches ✨</h1>
      </div>

      {matches.length === 0 ? (
        <p className="text-gray-500 italic">No matches yet. Keep swiping! 🔥</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {matches.map((profile) => (
            <div 
              key={profile.id} 
              onClick={() => setSelectedMatchId(profile.id)}
              className="relative aspect-square rounded-3xl overflow-hidden border border-white/10 cursor-pointer active:scale-95 transition-all"
            >
              <img src={profile.image_url} className="w-full h-full object-cover" alt={profile.full_name} />
              <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black to-transparent">
                <p className="font-bold text-sm">{profile.full_name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Matches;