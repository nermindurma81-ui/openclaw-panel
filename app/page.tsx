'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Bot, Send, RefreshCw, MessageSquare, Menu, X, Mic, Paperclip } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function OpenClawOS() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSidebar, setIsSidebar] = useState(false);
  const chatEnd = useRef<null | HTMLDivElement>(null);

  // REFRESH CHAT IZ BAZE
  useEffect(() => {
    const fetchMsgs = async () => {
      const { data } = await supabase.from('chat_messages').select('*').order('created_at', { ascending: true });
      if (data) setMessages(data);
    };
    fetchMsgs();
  }, []);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!input || loading) return;
    const msg = input; setInput(''); setLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: msg }]);

    try {
      // OVDJE JE BIO PROBLEM - TAČAN LINK DO API-JA
      const gatewayApi = `${process.env.NEXT_PUBLIC_GATEWAY_URL}/api/chat`;
      
      const res = await fetch(gatewayApi, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, userId: 'nermin-admin', conversationId: 'session-1' })
      });
      const data = await res.json();
      if (data.text) setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
      else throw new Error(data.error);
    } catch (e) { 
      toast.error("Gateway Offline! Provjeri Railway Variables."); 
    }
    setLoading(false);
  };

  const sync = async () => {
    toast.loading("Sinhronizacija...");
    const res = await fetch(`${process.env.NEXT_PUBLIC_GATEWAY_URL}/api/chat`, {
      method: 'POST',
      body: JSON.stringify({ action: 'sync', repo: 'nermindurma81-ui/Kralj-backup', userId: 'admin' })
    });
    if (res.ok) { toast.dismiss(); toast.success("Kralj je spreman!"); }
    else { toast.dismiss(); toast.error("Sync failed"); }
  };

  return (
    <div className="flex h-screen bg-[#0b0e14] text-[#e2e8f0] overflow-hidden font-sans">
      <Toaster />
      {/* SIDEBAR (Gensee Look) */}
      <aside className={`fixed md:relative z-50 w-72 h-full bg-[#11141b] border-r border-white/5 flex flex-col p-6 transition-all ${isSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center gap-3 mb-10 font-bold text-xl tracking-tighter"><Bot className="text-blue-500"/><span>OPENCLAW</span></div>
        <nav className="flex-1 space-y-2">
          <button onClick={() => setIsSidebar(false)} className="w-full text-left p-4 rounded-2xl flex items-center gap-3 bg-blue-600 text-white shadow-xl"><MessageSquare size={18}/> Chat</button>
          <button onClick={sync} className="w-full text-left p-4 rounded-2xl text-gray-500 hover:bg-white/5 flex items-center gap-3"><RefreshCw size={18}/> Sync Brain</button>
        </nav>
        <div className="p-4 bg-black/20 rounded-2xl text-[10px] font-bold text-blue-500 text-center uppercase tracking-widest">Admin Mode Active</div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col relative bg-[#0b0e14]">
        <header className="h-16 border-b border-white/5 flex items-center px-6 justify-between bg-[#0b0e14]/80 backdrop-blur-xl z-40">
          <Menu onClick={() => setIsSidebar(true)} className="md:hidden text-gray-400 cursor-pointer"/>
          <div className="flex items-center gap-3"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"/><span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Kralj v2.5 Stable</span></div>
        </header>

        {/* CHAT WINDOW */}
        <div className="flex-1 flex flex-col overflow-hidden relative p-4 md:p-8">
           <div className="bg-[#12161f] border border-white/10 flex-1 flex flex-col rounded-[2rem] shadow-3xl overflow-hidden max-w-5xl mx-auto w-full">
              <div className="h-10 bg-black/20 border-b border-white/5 flex items-center px-4 gap-2">
                 <div className="w-3 h-3 rounded-full bg-red-500"/><div className="w-3 h-3 rounded-full bg-yellow-500"/><div className="w-3 h-3 rounded-full bg-green-500"/>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-5 rounded-[2rem] text-sm shadow-2xl ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-[#161a23] border border-white/5 text-gray-100 rounded-bl-none'}`}>{m.content}</div>
                  </div>
                ))}
                <div ref={chatEnd} />
              </div>
           </div>

           {/* INPUT */}
           <div className="mt-6 max-w-4xl mx-auto w-full">
              <div className="bg-[#161a23]/95 backdrop-blur-xl border border-white/10 p-2 rounded-[2.5rem] flex items-center shadow-3xl">
                <label className="p-4 text-gray-500 hover:text-blue-400 cursor-pointer"><Paperclip size={22}/><input type="file" className="hidden"/></label>
                <input value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>e.key==='Enter' && handleSend()} placeholder="Reci Kralju šta treba..." className="flex-1 bg-transparent border-none p-4 text-sm text-white focus:outline-none" />
                <button onClick={handleSend} className="p-5 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg active:scale-90 transition-all">{loading ? <RefreshCw className="animate-spin" size={22}/> : <Send size={22}/>}</button>
              </div>
           </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 20px; }
      `}</style>
    </div>
  );
}
