import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const SwipeCard = () => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [aiVibe, setAiVibe] = useState<string>("Analyzing vibes...");
  const [showMatch, setShowMatch] = useState(false);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

  // 🌍 GLOBAL FETCH LOGIC
  useEffect(() => {
    async function fetchProfiles() {
      setLoading(true);
      
      // 1. Get current user so we can exclude them
      const { data: { user } } = await supabase.auth.getUser();

      // 2. Fetch all profiles except the current user
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user?.id); // "neq" means Not Equal

      if (error) {
        console.error("Error fetching profiles:", error);
      } else if (data) {
        setProfiles(data);
      }
      
      setLoading(false);
    }
    fetchProfiles();
  }, []);

  useEffect(() => {
    async function getAIVibe() {
      if (profiles.length > 0 && profiles[currentIndex]) {
        setAiVibe("Wingman is thinking...");
        try {
          const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: "You are the LinkVibez AI Wingman. Analyze chemistry. ALWAYS include a numerical score like 'Chemistry Score: 85/100' in your response.", 
          });

          const prompt = `Analyze this bio: "${profiles[currentIndex].bio}". Give me a score out of 100 and a cheeky reason why.`;
          const result = await model.generateContent(prompt);
          const responseText = result.response.text();
          setAiVibe(responseText);
        } catch (error) {
          setAiVibe("Vibe check unavailable.");
        }
      }
    }
    getAIVibe();
  }, [currentIndex, profiles]);

  const handleSwipeLogic = async (isLike: boolean) => {
    const person = profiles[currentIndex];
    
    if (isLike) {
      const scoreMatch = aiVibe.match(/\d+/);
      if (scoreMatch && parseInt(scoreMatch[0]) >= 85) {
        setShowMatch(true); 
        return; 
      }
    }

    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(-1); // End of deck
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white italic">LINKVIBEZ...</div>;
  if (profiles.length === 0 || currentIndex === -1) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-10 text-center">
        <h2 className="text-3xl font-black mb-4">NO MORE VIBES</h2>
        <p className="text-gray-400">You've reached the end of the global deck. Check back later!</p>
      </div>
    );
  }

  const person = profiles[currentIndex];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] overflow-hidden fixed inset-0 select-none">
      
      {/* 🏆 MATCH OVERLAY */}
      <AnimatePresence>
        {showMatch && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-purple-900/95 flex flex-col items-center justify-center p-10 text-center backdrop-blur-xl"
          >
            <motion.h2 
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-6xl font-black italic text-white mb-4 uppercase tracking-tighter"
            >
              It's a Match!
            </motion.h2>
            <p className="text-purple-200 text-xl mb-10 font-bold italic">The AI Wingman was right—the chemistry is off the charts!</p>
            
            <div className="flex gap-4 mb-10">
                <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-2xl">
                    <img src={person?.image_url} className="w-full h-full object-cover" />
                </div>
                <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-800 flex items-center justify-center text-2xl shadow-2xl">
                    ⚡️
                </div>
            </div>

            <button 
              onClick={() => {
                setShowMatch(false);
                setCurrentIndex(prev => prev + 1);
              }}
              className="w-full py-5 bg-white text-purple-900 rounded-full font-black text-xl uppercase tracking-widest hover:bg-gray-100 transition-all"
            >
              Send a Message
            </button>
            <button 
                onClick={() => {
                    setShowMatch(false);
                    setCurrentIndex(prev => prev + 1);
                }}
                className="mt-6 text-white/60 font-bold uppercase text-xs tracking-widest"
            >
                Keep Swiping
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <h1 className="text-4xl font-black mb-8 text-purple-500 italic tracking-tighter uppercase">LinkVibez</h1>
      
      <div className="mb-4 px-6 py-3 bg-purple-900/30 border border-purple-500/50 rounded-2xl max-w-[300px] text-center shadow-lg">
        <p className="text-purple-300 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">AI Wingman Analysis</p>
        <p className="text-white text-sm italic font-medium leading-tight">"{aiVibe}"</p>
      </div>

      <div className="relative w-[320px] h-[480px] cursor-grab active:cursor-grabbing">
        <AnimatePresence mode="wait">
          {!showMatch && (
            <motion.div
              key={person?.id}
              style={{ x, rotate, opacity }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x > 100) handleSwipeLogic(true);
                else if (info.offset.x < -100) handleSwipeLogic(false);
              }}
              className="absolute inset-0 bg-[#111] rounded-[40px] shadow-2xl border border-white/5 overflow-hidden"
            >
              <img src={person?.image_url} className="w-full h-full object-cover pointer-events-none" alt="profile" />
              <div className="absolute bottom-0 w-full p-8 bg-gradient-to-t from-black via-black/90 to-transparent">
                <h2 className="text-2xl font-black text-white">{person?.full_name}, {person?.age}</h2>
                <p className="text-purple-400 font-bold text-sm mb-2 uppercase">📍 {person?.location}</p>
                <p className="text-gray-300 text-sm line-clamp-2">{person?.bio}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex gap-10 mt-8 z-[100]">
        <button onClick={() => handleSwipeLogic(false)} className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-3xl hover:bg-white/10 active:scale-90 transition-all">❌</button>
        <button onClick={() => handleSwipeLogic(true)} className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center text-3xl shadow-lg active:scale-90 transition-all">🔥</button>
      </div>
    </div>
  );
};

export default SwipeCard;