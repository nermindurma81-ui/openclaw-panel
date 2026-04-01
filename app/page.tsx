'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Bot, Send, RefreshCw, Key, MessageSquare, Plus, Zap, Menu, X, Mic } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function OpenClawOS() {
  const [user] = useState<any>({ id: '00000000-0000-0000-0000-000000000000', email: 'nermindurma81@gmail.com' });
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [convId, setConvId] = useState('admin-session-default');
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const chatEndRef = useRef<null | HTMLDivElement>(null);

  // 1. REALNA LOGIKA: POVUCI PORUKE IZ BAZE PRI POKRETANJU
  useEffect(() => {
    const fetchHistory = async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
    };
    fetchHistory();
  }, [convId]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!input || loading) return;
    const msg = input; setInput(''); setLoading(true);
    
    // Lokalni update odmah
    setMessages(prev => [...prev, { role: 'user', content: msg }]);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_GATEWAY_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, userId: user.id, conversationId: convId, agentId: 'koder-pro' })
      });
      const data = await res.json();
      if (data.text) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
      }
    } catch (e) { toast.error("Gateway offline."); }
    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-[#0b0e14] text-[#e2e8f0] font-sans overflow-hidden">
      <Toaster />
      
      {/* SIDEBAR */}
      <aside className={`fixed md:relative z-50 w-72 h-full bg-[#11141b] border-r border-white/5 flex flex-col p-6 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0 shadow-[0_0_50px_#000]' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3 font-bold text-xl"><div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20"><Bot size={22}/></div><span>OPENCLAW</span></div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500"><X /></button>
        </div>

        <nav className="flex-1 space-y-2">
          <button onClick={() => setActiveTab('chat')} className={`w-full text-left p-4 rounded-2xl flex items-center gap-3 transition-all ${activeTab === 'chat' ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-500 hover:bg-white/5'}`}><MessageSquare size={18}/> Chat</button>
          <button onClick={() => setActiveTab('sync')} className={`w-full text-left p-4 rounded-2xl flex items-center gap-3 transition-all ${activeTab === 'sync' ? 'bg-white/10 text-white' : 'text-gray-500'}`}><RefreshCw size={18}/> Sync Brain</button>
        </nav>
        <div className="p-4 bg-black/20 rounded-2xl border border-white/5 mt-auto text-[10px] font-bold text-blue-500 uppercase tracking-widest text-center">Owner: {user.email}</div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col relative bg-[#0b0e14]">
        <header className="h-16 border-b border-white/5 flex items-center px-6 justify-between bg-[#0b0e14]/80 backdrop-blur-xl z-40">
          <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 bg-[#161a23] rounded-xl"><Menu size={20}/></button>
          <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"/><span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Kralj v2.5 Engine Active</span></div>
        </header>

        {activeTab === 'chat' ? (
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 scroll-smooth custom-scrollbar">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-message`}>
                  <div className={`max-w-[85%] md:max-w-[70%] p-5 rounded-[2rem] text-sm leading-relaxed shadow-2xl ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-[#161a23] border border-white/5 text-gray-100 rounded-bl-none'}`}>
                    <pre className="whitespace-pre-wrap font-sans">{m.content}</pre>
                  </div>
                </div>
              ))}
              {loading && <div className="text-blue-500 text-[10px] font-mono animate-pulse uppercase tracking-widest px-6">Kralj piše kod...</div>}
              <div ref={chatEndRef} />
            </div>

            <div className="p-6 md:p-10 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/90 to-transparent">
              <div className="max-w-4xl mx-auto relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2.5rem] blur opacity-10 group-focus-within:opacity-20 transition duration-1000"></div>
                <div className="relative flex items-center bg-[#161a23]/90 backdrop-blur-xl border border-white/10 p-2 rounded-[2.5rem] shadow-3xl">
                  <button className="p-4 text-gray-500"><Mic size={22} /></button>
                  <input value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>e.key==='Enter' && handleSend()} placeholder="Reci bratu, šta kucamo..." className="flex-1 bg-transparent border-none p-4 text-sm text-white focus:outline-none placeholder-gray-600" />
                  <button onClick={handleSend} className="p-5 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg active:scale-90 transition-all"><Send size={22} /></button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-10 text-center"><button onClick={async () => { toast.loading("Sync..."); await fetch(`${process.env.NEXT_PUBLIC_GATEWAY_URL}/api/system/sync`, {method:'POST', body: JSON.stringify({userId: user.id, repo: "nermindurma81-ui/Kralj-backup"})}); toast.dismiss(); toast.success("Mozak učitan!"); }} className="bg-blue-600 px-16 py-6 rounded-3xl font-bold text-xl">SYNC GITHUB BRAIN</button></div>
        )}
      </main>
    </div>
  );
}
