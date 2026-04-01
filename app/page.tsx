'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Bot, Send, RefreshCw, Key, ShieldCheck, LogOut, 
  MessageSquare, Plus, Zap, Menu, X, Mic, Layers, 
  Cpu, Globe, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function OpenClawOS() {
  const [activeTab, setActiveTab] = useState('chat');
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [convId, setConvId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('koder-pro');
  const [availableAgents, setAvailableAgents] = useState<any[]>([
    { id: 'koder-pro', name: 'Koder Pro (Učitavam...)' }
  ]);
  
  const chatEndRef = useRef<null | HTMLDivElement>(null);

  // 1. DOHVATANJE KORISNIKA I AGENATA IZ BAZE
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchConversations(session.user.id);
        loadInstalledAgents(session.user.id);
      }
    });
  }, []);

  const loadInstalledAgents = async (uid: string) => {
    const { data } = await supabase.from('system_settings').select('value').like('key', 'agent_config_%');
    if (data && data.length > 0) {
      const agents = data.map(d => JSON.parse(d.value));
      setAvailableAgents(agents);
      setSelectedAgent(agents[0].id);
    } else {
      // Default ako baza još nema ništa
      setAvailableAgents([{ id: 'koder-pro', name: 'Koder Pro (Free)' }]);
    }
  };

  // 2. SINHRONIZACIJA AGENT HUBA (Tvoj moji-agenti repo)
  const syncAgentHub = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_GATEWAY_URL}/api/agents/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      if (res.ok) {
        await loadInstalledAgents(user.id);
        toast.success("Agent Hub je ažuriran! 👑");
      }
    } catch (e) {
      toast.error("Sync nije uspio.");
    } finally { setSyncing(false); }
  };

  // 3. SLANJE PORUKE (STVARNI GATEWAY POZIV)
  const handleSend = async () => {
    if (!input || !convId) return;
    const msg = input; setInput(''); setLoading(true);
    
    // Odmah prikaži u UI
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
      if (data.text) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
      }
    } catch (e) {
      toast.error("Gateway trenutno ne odgovara.");
    } finally { setLoading(false); }
  };

  // --- POMOĆNE FUNKCIJE ---
  const startNewSession = async (uid: string) => {
    const { data } = await supabase.from('conversations').insert([{ user_id: uid, title: 'Novi Razgovor' }]).select().single();
    if (data) { setConvId(data.id); setMessages([]); }
  };

  const fetchConversations = async (uid: string) => {
    const { data } = await supabase.from('conversations').select('*').eq('user_id', uid).order('created_at', { ascending: false });
    if (data && data.length > 0) setConvId(data[0].id);
    else startNewSession(uid);
  };

  if (!user) return <div className="h-screen bg-[#0b0e14] flex items-center justify-center"><button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })} className="bg-white text-black px-10 py-4 rounded-2xl font-bold">UĐI U OPENCLAW OS 👑</button></div>;

  return (
    <div className="flex h-screen bg-[#0b0e14] text-[#e2e8f0] font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className={`fixed md:relative z-50 w-72 h-full bg-[#11141b]/90 backdrop-blur-2xl border-r border-white/5 flex flex-col p-5 shadow-2xl transition-all ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 text-white font-bold">OC</div>
            <span className="text-xl font-bold tracking-tighter uppercase">OpenClaw</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 text-gray-500"><X /></button>
        </div>

        <button onClick={() => startNewSession(user.id)} className="w-full flex items-center justify-center gap-2 p-4 bg-white text-black rounded-2xl text-sm font-bold shadow-xl active:scale-95 mb-6 hover:bg-gray-100 transition-all">
          <Plus size={18} /> New Session
        </button>

        <nav className="flex-1 space-y-1">
          <button onClick={() => setActiveTab('chat')} className={`w-full text-left p-4 rounded-2xl flex items-center gap-3 transition-all ${activeTab === 'chat' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
            <MessageSquare size={18}/> Chat
          </button>
          <button onClick={() => setActiveTab('agents')} className={`w-full text-left p-4 rounded-2xl flex items-center gap-3 transition-all ${activeTab === 'agents' ? 'bg-white/5 text-white' : 'text-gray-400'}`}>
            <Layers size={18}/> Agent Hub
          </button>
          <button onClick={async () => {
             setSyncing(true);
             await fetch(`${process.env.NEXT_PUBLIC_GATEWAY_URL}/api/system/sync`, { method: 'POST', body: JSON.stringify({ userId: user.id, repo: "nermindurma81-ui/Kralj-backup" }) });
             setSyncing(false); toast.success("Mozak učitan!");
          }} className="w-full text-left p-4 rounded-2xl text-gray-400 hover:bg-white/5 flex items-center gap-3">
            <RefreshCw size={18} className={syncing ? 'animate-spin' : ''}/> Sync Brain
          </button>
        </nav>

        <div className="mt-auto p-4 border-t border-white/5 flex items-center justify-between">
           <div className="text-[10px] font-bold text-gray-500 truncate">{user.email}</div>
           <button onClick={() => supabase.auth.signOut()} className="text-gray-600 hover:text-red-500"><LogOut size={16}/></button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col relative min-w-0 bg-[#0b0e14]">
        
        <header className="h-16 border-b border-white/5 flex items-center px-6 justify-between bg-[#0b0e14]/80 backdrop-blur-xl z-20">
           <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-gray-400 hover:bg-white/5 rounded-lg"><Menu size={20}/></button>
              
              {/* DINAMIČKI SELEKTOR AGENATA */}
              <select 
                value={selectedAgent} 
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="bg-[#161a23] text-[10px] font-bold text-blue-400 border border-white/10 px-4 py-2 rounded-full outline-none uppercase tracking-widest cursor-pointer hover:border-blue-500/40 transition-all"
              >
                {availableAgents.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
           </div>
           <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"/><span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Gateway Live</span></div>
        </header>

        {activeTab === 'chat' ? (
          <div className="flex-1 flex flex-col overflow-hidden relative">
             <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 scroll-smooth custom-scrollbar">
                {messages.length === 0 && (
                   <div className="h-full flex flex-col items-center justify-center opacity-40 text-center">
                      <Bot size={50} className="text-blue-500 mb-4 animate-bounce"/>
                      <h2 className="text-2xl font-bold tracking-tighter italic">"Reci, Kralju..."</h2>
                   </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[85%] md:max-w-[70%] p-5 rounded-[2rem] text-sm leading-relaxed shadow-2xl ${
                      m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none shadow-blue-900/20' : 'bg-[#161a23] border border-white/5 text-gray-100 rounded-bl-none shadow-black/50'
                    }`}>{m.content}</div>
                  </div>
                ))}
                {loading && <div className="text-blue-500 text-[10px] font-mono animate-pulse uppercase tracking-[0.3em]">Kralj procesira...</div>}
                <div ref={chatEndRef} />
             </div>

             {/* Gensee Floating Input */}
             <div className="p-4 md:p-10 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/90 to-transparent">
                <div className="max-w-4xl mx-auto relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2.5rem] blur opacity-10 group-focus-within:opacity-20 transition duration-1000"></div>
                  <div className="relative flex items-center bg-[#161a23]/90 backdrop-blur-xl border border-white/10 p-2 rounded-[2.5rem] shadow-3xl focus-within:border-blue-500/50 transition-all">
                    <button className="p-4 text-gray-500 hover:text-blue-400 transition-colors"><Mic size={22} /></button>
                    <input value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>e.key==='Enter' && handleSend()} placeholder="Poruka tvom AI agentu..." className="flex-1 bg-transparent border-none p-4 text-sm text-white focus:outline-none placeholder-gray-600" />
                    <button onClick={handleSend} className="p-5 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-600/30 transition-all active:scale-90"><Send size={22} /></button>
                  </div>
                </div>
             </div>
          </div>
        ) : (
          <div className="p-10 max-w-2xl mx-auto w-full text-center">
             <div className="bg-[#161a23] p-16 rounded-[4rem] border border-white/5 shadow-3xl">
                <Layers size={64} className="mx-auto text-blue-500 mb-8 animate-spin-slow opacity-30" />
                <h2 className="text-3xl font-bold uppercase mb-4 tracking-tighter">Agent Hub Sync</h2>
                <p className="text-gray-400 mb-10 text-sm">Povuci Kodera i ostale agente sa <b>moji-agenti</b> repoa.</p>
                <button onClick={syncAgentHub} disabled={syncing} className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-3xl font-bold text-xl shadow-2xl transition-all active:scale-95">
                   {syncing ? "SINKRONIZUJEM..." : "SYNC AGENT REPO"}
                </button>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}
