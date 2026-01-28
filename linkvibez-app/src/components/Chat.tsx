import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const Chat = ({ matchId, onBack }: { matchId: string, onBack: () => void }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [aiFeedback, setAiFeedback] = useState("");

  useEffect(() => {
    // 1. Fetch initial messages
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${matchId},receiver_id.eq.${matchId}`)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
    };
    fetchMessages();

    // 2. Real-time listener (Go-Live roadmap step)
    const channel = supabase
      .channel('realtime messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [matchId]);

  const sendMessage = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !newMessage.trim()) return;

    // 🧠 AI Tone Analysis (Roadmap Step 4)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(`Analyze the tone of this dating message: "${newMessage}". Be brief.`);
    setAiFeedback(result.response.text());

    await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: matchId,
      content: newMessage
    });
    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <div className="p-6 border-b border-white/10 flex items-center">
        <button onClick={onBack} className="mr-4 text-purple-500 font-bold">← BACK</button>
        <h2 className="font-black uppercase italic text-purple-500">LinkVibez Chat</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col">
        {messages.map((msg) => (
          <div key={msg.id} className={`max-w-[80%] p-4 rounded-2xl ${msg.sender_id === matchId ? 'bg-white/10 self-start' : 'bg-purple-600 self-end'}`}>
            <p className="text-sm">{msg.content}</p>
          </div>
        ))}
      </div>

      {aiFeedback && (
        <div className="mx-6 p-3 bg-purple-900/30 border border-purple-500/30 rounded-xl mb-2">
          <p className="text-[10px] font-black uppercase text-purple-300 tracking-widest">Wingman Note</p>
          <p className="text-xs italic text-white/80">{aiFeedback}</p>
        </div>
      )}

      <div className="p-6 bg-[#111] flex gap-2">
        <input 
          className="flex-1 bg-white/5 border border-white/10 p-4 rounded-xl outline-none"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Send a vibe..."
        />
        <button onClick={sendMessage} className="bg-purple-600 px-6 rounded-xl font-bold uppercase text-xs">Send</button>
      </div>
    </div>
  );
};

export default Chat;