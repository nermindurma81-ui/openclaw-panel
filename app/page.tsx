'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Bot, Send, RefreshCw, Key, ShieldCheck, MessageSquare, Plus, Zap, Menu, X, Mic, Cpu, Globe, Layers } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function OpenClawOS() {
  const [user] = useState<any>({ id: '00000000-0000-0000-0000-000000000000', email: 'nermindurma81@gmail.com' });
  const [activeTab, setActiveTab] = useState('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [convId, setConvId] = useState('admin-session-default');
  const [loading, setLoading] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [selectedAgent, setSelectedAgent] = useState('koder-pro');

  const chatEndRef = useRef<null | HTMLDivElement>(null);

  // POVUCI ISTORIJU
  useEffect(() => {
    const fetchHistory = async () => {
      const { data } = await supabase.from('chat_messages').select('*').eq('conversation_id', convId).order('created_at', { ascending: true });
      if (data) setMessages(data);
    };
    fetchHistory();
  }, [convId]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!input || loading) return;
    const msg = input; setInput(''); setLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: msg }]);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_GATEWAY_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, userId: user.id, conversationId: convId, agentId: selectedAgent })
      });
      const data = await res.json();
      if (data.text) setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
      else toast.error("Gateway error: " + data.error);
    } catch (e) { toast.error("Gateway Offline!"); }
    setLoading(false);
  };

  const handleSync = async () => {
    setSyncLogs(["Dohvatam Kralj-backup...", "Učitavam skillove..."]);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_GATEWAY_URL}/api/system/sync`, {
        method: 'POST',
        body: JSON.stringify({ userId: user.id, repo: "nermindurma81-ui/Kralj-backup" })
      });
      setSyncLogs(prev => [...prev, "✅ USPEŠNO: Kralj je u bazi!"]);
      toast.success("Sinhronizovano!");
    } catch (e) { toast.error("Sync failed"); }
  };

  return (
    <div className="flex h-screen bg-[#0b0e14] text-[#e2e8f0] font-sans overflow-hidden">
      <Toaster />
      
      {/* SIDEBAR (FULL OPTIONS) */}
      <aside className={`fixed md:relative z-50 w-72 h-full bg-[#11141b] border-r border-white/5 flex flex-col p-6 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center gap-3 mb-10 font-bold text-xl tracking-tighter">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg"><Bot size={22}/></div>
          <span>OPENCLAW</span>
        </div>

        <nav className="flex-1 space-y-2">
          <button onClick={() => {setActiveTab('chat'); setIsSidebarOpen(false);}} className={`w-full text-left p-4 rounded-2xl flex items-center gap-3 ${activeTab === 'chat' ? 'bg-blue-600 shadow-xl' : 'text-gray-500 hover:bg-white/5'}`}>
            <MessageSquare size={18}/> Chat
          </button>
          <button onClick={() => {setActiveTab('sync'); setIsSidebarOpen(false);}} className={`w-full text-left p-4 rounded-2xl flex items-center gap-3 ${activeTab === 'sync' ? 'bg-white/10 text-white border border-white/10' : 'text-gray-500 hover:bg-white/5'}`}>
            <RefreshCw size={18}/> Sync Brain
          </button>
          <button onClick={() => {setActiveTab('tokens'); setIsSidebarOpen(false);}} className={`w-full text-left p-4 rounded-2xl flex items-center gap-3 ${activeTab === 'tokens' ? 'bg-white/10 text-white border border-white/10' : 'text-gray-500 hover:bg-white/5'}`}>
            <Key size={18}/> Tokens
          </button>
          <button onClick={() => {setActiveTab('security'); setIsSidebarOpen(false);}} className={`w-full text-left p-4 rounded-2xl flex items-center gap-3 ${activeTab === 'security' ? 'bg-white/10 text-white border border-white/10' : 'text-gray-500 hover:bg-white/5'}`}>
            <ShieldCheck size={18}/> Security
          </button>
        </nav>
        <div className="p-4 bg-black/20 rounded-2xl border border-white/5 mt-auto text-[10px] font-bold text-blue-500 uppercase text-center tracking-widest">Admin: {user.email}</div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col relative bg-[#0b0e14]">
        {/* HEADER WITH SELECTOR */}
        <header className="h-16 border-b border-white/5 flex items-center px-6 justify-between bg-[#0b0e14]/80 backdrop-blur-xl z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 bg-[#161a23] rounded-xl"><Menu size={20}/></button>
            <select 
              value={selectedAgent} 
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="bg-[#161a23] text-[10px] font-bold text-blue-400 border border-white/10 px-4 py-2 rounded-full outline-none uppercase tracking-widest cursor-pointer hover:border-blue-500/50"
            >
              <option value="koder-pro">Koder Pro (Free)</option>
              <option value="groq-llama">Groq Llama 3.3</option>
              <option value="github-gpt4">GPT-4o (GitHub)</option>
            </select>
          </div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/><span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest">Gateway Live</span></div>
        </header>

        {activeTab === 'chat' ? (
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 scroll-smooth custom-scrollbar">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-40 space-y-4">
                  <Bot size={60} className="text-blue-500 animate-bounce"/>
                  <h2 className="text-3xl font-bold tracking-tighter italic">"Reci Kralju..."</h2>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-message`}>
                  <div className={`max-w-[85%] md:max-w-[70%] p-5 rounded-[2rem] text-sm leading-relaxed shadow-2xl ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-[#161a23] border border-white/5 text-gray-100 rounded-bl-none'}`}>
                    <pre className="whitespace-pre-wrap font-sans">{m.content}</pre>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* INPUT AREA (GENSEE STYLE) */}
            <div className="p-6 md:p-10 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/90 to-transparent">
              <div className="max-w-4xl mx-auto relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2.5rem] blur opacity-10 transition duration-1000 group-focus-within:opacity-20"></div>
                <div className="relative flex items-center bg-[#161a23]/90 backdrop-blur-xl border border-white/10 p-2 rounded-[2.5rem] shadow-3xl">
                  <button className="p-4 text-gray-500 hover:text-blue-400 transition-colors"><Mic size={22} /></button>
                  <input value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>e.key==='Enter' && handleSend()} placeholder="Šta kucamo, Kralju?" className="flex-1 bg-transparent border-none p-4 text-sm text-white focus:outline-none placeholder-gray-600" />
                  <button onClick={handleSend} className="p-5 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg active:scale-90 transition-all"><Send size={22} /></button>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'sync' ? (
          <div className="p-10 text-center max-w-2xl mx-auto space-y-10">
             <div className="bg-[#161a23] p-12 rounded-[3rem] border border-white/5 shadow-3xl">
                <RefreshCw size={60} className={`mx-auto text-blue-500 mb-6 ${loading ? 'animate-spin' : ''}`} />
                <h2 className="text-2xl font-bold uppercase mb-8 tracking-tighter">Brain Sync Engine</h2>
                <button onClick={handleSync} className="bg-blue-600 px-12 py-5 rounded-3xl font-bold text-lg shadow-2xl transition-all">SYNC FROM GITHUB</button>
             </div>
             {syncLogs.length > 0 && (
               <div className="bg-black/40 p-6 rounded-3xl text-left font-mono text-[10px] text-blue-400 space-y-1 border border-white/5">
                 {syncLogs.map((l, i) => <div key={i}>{">"} {l}</div>)}
               </div>
             )}
          </div>
        ) : (
          <div className="p-20 text-center opacity-30 h-full flex flex-col items-center justify-center">
            <ShieldCheck size={100} className="mx-auto mb-6 text-blue-500"/>
            <h2 className="text-2xl font-bold">Modul Aktivan.</h2>
            <p className="text-sm">Uđi u Chat da počneš.</p>
          </div>
        )}
      </main>
    </div>
  );
}
