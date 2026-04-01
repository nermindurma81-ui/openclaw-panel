'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Bot, Send, RefreshCw, Key, ShieldCheck, LogOut, 
  MessageSquare, Plus, Zap, Menu, X, Mic, Layers 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function OpenClawOS() {
  // --- LOGIN BYPASS: HARDKODOVAN ADMIN ---
  const [user, setUser] = useState<any>({
    id: '00000000-0000-0000-0000-000000000000', // Fixni ID za bazu
    email: 'nermindurma81@gmail.com'
  });
  const [isOwner, setIsOwner] = useState(true); // Ti si uvijek vlasnik
  
  const [activeTab, setActiveTab] = useState('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [convId, setConvId] = useState<string>('admin-session-1');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('koder-pro');
  const [availableAgents, setAvailableAgents] = useState<any[]>([]);
  
  const chatEndRef = useRef<null | HTMLDivElement>(null);

  // Učitaj poruke i agente čim se stranica otvori (bez pitanja za login)
  useEffect(() => {
    loadAgents();
    fetchMessages();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadAgents = async () => {
    const { data } = await supabase.from('system_settings').select('value').like('key', 'agent_config_%');
    if (data && data.length > 0) {
      setAvailableAgents(data.map(d => JSON.parse(d.value)));
    } else {
      setAvailableAgents([{ id: 'koder-pro', name: 'Koder Pro (Free)' }]);
    }
  };

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  const handleSend = async () => {
    if (!input || loading) return;
    const msg = input; setInput(''); setLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: msg }]);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_GATEWAY_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: msg, 
          userId: user.id, 
          conversationId: convId, 
          agentId: selectedAgent 
        })
      });
      const data = await res.json();
      if (data.text) setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch (e) { toast.error("Gateway offline."); }
    setLoading(false);
  };

  const syncBrain = async () => {
    setSyncing(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_GATEWAY_URL}/api/system/sync`, {
        method: 'POST',
        body: JSON.stringify({ userId: user.id, repo: "nermindurma81-ui/Kralj-backup" })
      });
      toast.success("Sinhronizacija završena! 👑");
    } catch (e) { toast.error("Sync fail."); }
    setSyncing(false);
  };

  return (
    <div className="flex h-screen bg-[#0b0e14] overflow-hidden text-[#e2e8f0]">
      
      {/* SIDEBAR */}
      <aside className={`fixed md:relative z-50 w-72 h-full bg-[#11141b]/95 backdrop-blur-xl border-r border-white/5 flex flex-col p-6 transition-all ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3 font-bold text-xl tracking-tighter">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg"><Bot size={22}/></div>
            <span>OPENCLAW</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden"><X /></button>
        </div>

        <nav className="flex-1 space-y-2">
          <button onClick={() => setActiveTab('chat')} className={`w-full text-left p-4 rounded-2xl ${activeTab === 'chat' ? 'bg-blue-600 shadow-xl' : 'text-gray-500 hover:bg-white/5'}`}>
            <MessageSquare size={18} className="inline mr-3"/> Chat
          </button>
          <button onClick={() => setActiveTab('config')} className={`w-full text-left p-4 rounded-2xl ${activeTab === 'config' ? 'bg-white/10 text-white' : 'text-gray-500'}`}>
            <RefreshCw size={18} className="inline mr-3"/> Sync Brain
          </button>
        </nav>

        <div className="p-4 bg-black/20 rounded-2xl border border-white/5 mt-auto">
          <p className="text-[10px] font-bold text-blue-500 uppercase">Superuser Mode</p>
          <p className="text-xs truncate">{user.email}</p>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col relative bg-[#0b0e14]">
        <header className="h-16 border-b border-white/5 flex items-center px-8 justify-between bg-[#0b0e14]/80 backdrop-blur-xl">
          <button onClick={() => setIsSidebarOpen(true)} className="md:hidden"><Menu/></button>
          <div className="flex items-center gap-4">
             <select value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)} className="bg-[#161a23] text-[10px] font-bold text-blue-400 border border-white/10 px-4 py-2 rounded-full outline-none">
               {availableAgents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
             </select>
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"/>
          </div>
          <span className="text-[10px] font-mono text-gray-600 uppercase">No-Auth Admin Bypass</span>
        </header>

        {activeTab === 'chat' ? (
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 scroll-smooth">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-5 rounded-[2rem] text-sm shadow-2xl ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-[#1c212c] border border-white/5 text-gray-100'}`}>{m.content}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            
            <div className="p-6 md:p-10">
              <div className="max-w-4xl mx-auto bg-[#161a23] border border-white/10 p-2 rounded-[2.5rem] flex items-center shadow-3xl">
                <button className="p-4 text-gray-500"><Mic size={22} /></button>
                <input value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>e.key==='Enter' && handleSend()} placeholder="Gazda, reci šta treba..." className="flex-1 bg-transparent p-4 outline-none text-sm" />
                <button onClick={handleSend} className="p-5 bg-blue-600 rounded-full hover:bg-blue-500"><Send size={22} /></button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-20 text-center">
            <button onClick={syncBrain} className="bg-blue-600 hover:bg-blue-700 text-white px-16 py-6 rounded-3xl font-bold text-xl shadow-2xl">
               {syncing ? "SINKRONIZUJEM MOZAK..." : "SYNC BRAIN FROM GITHUB"}
            </button>
            <p className="mt-6 text-gray-500 text-sm">Ovo će učitati tvoj SOUL.md i Skillove bez potrebe za loginom.</p>
          </div>
        )}
      </main>
    </div>
  );
}
