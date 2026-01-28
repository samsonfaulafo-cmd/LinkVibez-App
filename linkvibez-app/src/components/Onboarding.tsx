import MediaManager from './MediaManager';
import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

const Onboarding = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: '',
    dob_day: '',
    dob_month: '',
    dob_year: '',
    location: 'Brisbane, QLD',
    bio: '',
    vibe: '',
    image_url: '',
    latitude: null as number | null,
    longitude: null as number | null
  });

  const nextStep = () => setStep(s => s + 1);

  // 📍 NEW: Geolocation Function
  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      setFormData({ 
        ...formData, 
        latitude, 
        longitude, 
        location: "Brisbane, QLD (GPS Active)" 
      });
      alert("Vibe check: Location found! 📍");
    }, (error) => {
      console.error(error);
      alert("Check browser permissions to enable location.");
    });
  };

  const saveProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const age = new Date().getFullYear() - parseInt(formData.dob_year);
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: formData.full_name,
        age: age,
        location: formData.location,
        bio: formData.bio || `Just a ${formData.vibe} soul from Brisbane looking for good vibez.`,
        image_url: formData.image_url || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167',
        // 🚀 SAVING COORDINATES NOW
        latitude: formData.latitude,
        longitude: formData.longitude
      });
      if (!error) onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Progress Bar */}
      <div className="fixed top-12 left-0 right-0 flex justify-center gap-2 px-10">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`h-1 flex-1 rounded-full transition-all ${step >= s ? 'bg-purple-500' : 'bg-white/10'}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1: NAME, BIRTHDAY & LOCATION */}
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ x: 50, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            exit={{ x: -50, opacity: 0 }}
            className="w-full max-w-sm"
          >
            <h2 className="text-4xl font-black italic mb-2 uppercase tracking-tighter text-purple-500">The Basics</h2>
            <p className="text-gray-400 mb-10 text-sm">Tell us who you are, Brisbane style.</p>
            
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Full Name</label>
            <input 
              className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-purple-500 transition-all mb-6 text-xl"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              placeholder="e.g. Bluey"
            />

            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Date of Birth</label>
            <div className="flex gap-3 mb-6">
              <input placeholder="DD" maxLength={2} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-center text-xl" 
                value={formData.dob_day} onChange={(e) => setFormData({...formData, dob_day: e.target.value})} />
              <input placeholder="MM" maxLength={2} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-center text-xl"
                value={formData.dob_month} onChange={(e) => setFormData({...formData, dob_month: e.target.value})} />
              <input placeholder="YYYY" maxLength={4} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-center text-xl"
                value={formData.dob_year} onChange={(e) => setFormData({...formData, dob_year: e.target.value})} />
            </div>

            {/* 📍 GPS DETECTION BUTTON */}
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Location</label>
            <div className="flex gap-2 mb-10">
              <input 
                className="flex-1 bg-white/5 border border-white/10 p-4 rounded-xl outline-none text-sm text-gray-400"
                value={formData.location}
                readOnly
              />
              <button 
                onClick={detectLocation}
                className="bg-purple-600/20 border border-purple-500/50 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-purple-600 transition-all"
              >
                Detect 📍
              </button>
            </div>

            <button 
              disabled={!formData.full_name || !formData.dob_year}
              onClick={nextStep} 
              className="w-full py-5 bg-purple-600 rounded-full font-black text-lg shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
            >
              CONTINUE →
            </button>
          </motion.div>
        )}

        {/* STEP 2: THE VIBE CHECK */}
        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ x: 50, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            exit={{ x: -50, opacity: 0 }}
            className="w-full max-w-sm"
          >
            <h2 className="text-4xl font-black italic mb-2 uppercase tracking-tighter text-purple-500">Pick Your Vibe</h2>
            <p className="text-gray-400 mb-8 text-sm">How would your friends describe you?</p>
            
            <div className="grid grid-cols-1 gap-4 mb-10">
              {[
                { label: '🔥 High Energy', val: 'Energetic' },
                { label: '🌊 Chill & Laid Back', val: 'Chill' },
                { label: '🎨 Creative Soul', val: 'Creative' },
                { label: '🧗 Adventure Seeker', val: 'Adventurous' }
              ].map((v) => (
                <button 
                  key={v.val}
                  onClick={() => setFormData({...formData, vibe: v.val})}
                  className={`w-full p-6 rounded-2xl border text-left font-bold transition-all ${
                    formData.vibe === v.val ? 'bg-purple-600 border-white text-white' : 'bg-white/5 border-white/10 text-white/60'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>

            <button 
              disabled={!formData.vibe}
              onClick={nextStep} 
              className="w-full py-5 bg-purple-600 rounded-full font-black text-lg active:scale-95 transition-all"
            >
              ALMOST THERE →
            </button>
          </motion.div>
        )}

        {/* STEP 3: THE GLOW UP */}
        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ x: 50, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            className="w-full max-w-sm flex flex-col items-center"
          >
            <h2 className="text-4xl font-black italic mb-2 uppercase tracking-tighter text-purple-500">The Glow Up</h2>
            <p className="text-gray-400 mb-6 text-sm text-center">Final step: Add your photo and bio.</p>

            <div className="mb-8 w-full">
              <MediaManager onUpload={(url) => setFormData({...formData, image_url: url})} />
              {formData.image_url && (
                <motion.img 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  src={formData.image_url} 
                  className="mt-4 w-32 h-32 rounded-2xl object-cover mx-auto border-2 border-purple-500 shadow-lg shadow-purple-500/20" 
                  alt="preview" 
                />
              )}
            </div>
            
            <textarea 
              className="w-full h-32 bg-white/5 border border-white/10 p-6 rounded-3xl outline-none focus:border-purple-500 transition-all mb-8 text-lg resize-none"
              placeholder="I love weekend trips to the Sunny Coast and finding the best coffee in Fortitude Valley..."
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
            />

            <button 
              onClick={saveProfile}
              className="w-full py-6 bg-white text-black rounded-full font-black text-xl shadow-xl active:scale-95 transition-all"
            >
              GO LIVE ✨
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Onboarding;