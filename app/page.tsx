'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Bot, Send, RefreshCw, Key, ShieldCheck, LogOut, 
  MessageSquare, Plus, Zap, Menu, X, Mic, Layers, 
  Cpu, Globe, Sparkles, Shield 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function OpenClawOS() {
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState('chat');
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [convId, setConvId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('koder-pro');
  
  const chatEndRef = useRef<null | HTMLDivElement>(null);

  // --- INITIALIZATION & AUTH ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleUserAuthenticated(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) handleUserAuthenticated(session.user);
      else setUser(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUserAuthenticated = (userData: any) => {
    setUser(userData);
    if (userData.email === 'nermindurma81@gmail.com') setIsOwner(true);
    fetchConversations(userData.id);
  };

  useEffect(() => {
    if (convId) fetchMessages(convId);
  }, [convId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- DATA FETCHING ---
  const fetchConversations = async (uid: string) => {
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });
    if (data && data.length > 0) {
      setConversations(data);
      if (!convId) setConvId(data[0].id);
    } else {
      startNewSession(uid);
    }
  };

  const fetchMessages = async (id: string) => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  // --- ACTIONS ---
  const startNewSession = async (uid: string) => {
    const { data } = await supabase
      .from('conversations')
      .insert([{ user_id: uid, title: 'Nova Sesija' }])
      .select()
      .single();
    if (data) {
      setConvId(data.id);
      setConversations(prev => [data, ...prev]);
      setMessages([]);
    }
  };

  const handleSend = async () => {
    if (!input || !convId || !user) return;
    const msg = input;
    setInput('');
    setLoading(true);
    
    // Dodaj lokalno odmah radi brzine
    const tempMsg = { role: 'user', content: msg };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_GATEWAY_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: msg, 
          userId: user.id, 
          conversationId: convId,
          agentId: selectedAgent // Šaljemo izabranog bota
        })
      });
      const data = await res.json();
      if (data.text) {
        fetchMessages(convId);
      } else {
        toast.error(data.error || "Greška na Gateway-u");
      }
    } catch (e) {
      toast.error("Gateway nije dostupan.");
    } finally {
      setLoading(false);
    }
  };

  const syncBrain = async () => {
    setSyncing(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_GATEWAY_URL}/api/system/sync`, {
        method: 'POST',
        body: JSON.stringify({ userId: user.id, repo: "nermindurma81-ui/Kralj-backup" })
      });
      toast.success("Tvoja duša je sinkronizovana! 👑");
    } catch (e) {
      toast.error("Sync neuspješan.");
    } finally {
      setSyncing(false);
    }
  };

  const syncAgentHub = async () => {
    setSyncing(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_GATEWAY_URL}/api/agents/sync`, {
        method: 'POST',
        body: JSON.stringify({ userId: user.id })
      });
      toast.success("Agent Hub ažuriran! 🚀");
    } catch (e) {
      toast.error("Greška pri učitavanju agenata.");
    } finally {
      setSyncing(false);
    }
  };

  // --- RENDER LOGIN ---
  if (!user) {
    return (
      <div className="h-screen bg-[#0b0e14] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-blue-600/10 rounded-[2.5rem] flex items-center justify-center border border-blue-600/20 mb-8 animate-pulse">
          <Bot size={48} className="text-blue-500" />
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tighter mb-2">OPENCLAW OS</h1>
        <p className="text-gray-500 mb-10 max-w-xs">Prijavi se da aktiviraš svog nezavisnog AI asistenta.</p>
        <button 
          onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
          className="bg-white text-black px-10 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-2xl"
        >
          UĐI KAO KRALJ 👑
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0b0e14] text-[#e2e8f0] font-sans overflow-hidden">
      
      {/* --- SIDEBAR (GENSEE STYLE) --- */}
      <aside className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 fixed md:relative z-50 w-72 h-full bg-[#11141b]/90 backdrop-blur-2xl border-r border-white/5 
        flex flex-col p-5 shadow-2xl transition-transform duration-300 ease-in-out
      `}>
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Bot className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold tracking-tighter text-white uppercase">OpenClaw</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 text-gray-500"><X size={20}/></button>
        </div>

        <button 
          onClick={() => startNewSession(user.id)}
          className="w-full flex items-center justify-center gap-2 p-4 bg-white text-black rounded-2xl text-sm font-bold transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 mb-6"
        >
          <Plus size={18} /> New Session
        </button>

        <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] px-4 mb-3">Main</p>
          <button onClick={() => {setActiveTab('chat'); setIsSidebarOpen(false);}} 
            className={`w-full text-left p-4 rounded-2xl flex items-center gap-3 transition-all ${activeTab === 'chat' ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-500 hover:bg-white/5'}`}>
            <MessageSquare size={18}/> Chat
          </button>
          
          <div className="py-6 text-[10px] text-gray-600 font-bold uppercase tracking-[0.3em] px-4">Management</div>
          <button onClick={() => setActiveTab('config')} className={`w-full text-left p-4 rounded-2xl flex items-center gap-3 transition-all ${activeTab === 'config' ? 'bg-white/5 text-white' : 'text-gray-500 hover:bg-white/5'}`}>
            <RefreshCw size={18}/> Sync Brain
          </button>
          <button onClick={() => setActiveTab('agents')} className={`w-full text-left p-4 rounded-2xl flex items-center gap-3 transition-all ${activeTab === 'agents' ? 'bg-white/5 text-white' : 'text-gray-500 hover:bg-white/5'}`}>
            <Layers size={18}/> Agent Hub
          </button>

          {isOwner && (
            <button onClick={() => setActiveTab('security')} className={`w-full text-left p-4 rounded-2xl flex items-center gap-3 transition-all ${activeTab === 'security' ? 'text-red-400 bg-red-400/5' : 'text-gray-500 hover:bg-white/5'}`}>
              <Shield size={18}/> Security
            </button>
          )}
        </nav>

        {/* USER PROFILE */}
        <div className="mt-auto p-2 bg-black/20 rounded-[2rem] border border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-xs">ND</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate">{user?.email?.split('@')[0]}</p>
            <p className="text-[9px] text-blue-500 font-bold uppercase tracking-tighter">{isOwner ? 'Unlimited Mode' : 'Standard Tier'}</p>
          </div>
          <button onClick={() => supabase.auth.signOut()} className="p-2 text-gray-600 hover:text-red-500 transition-colors"><LogOut size={16}/></button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col relative min-w-0 bg-[#0b0e14]">
        
        {/* HEADER BAR */}
        <header className="h-16 border-b border-white/5 flex items-center px-6 justify-between bg-[#0b0e14]/80 backdrop-blur-xl z-20">
           <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-gray-400 hover:bg-white/5 rounded-lg"><Menu size={20}/></button>
              <div className="flex items-center gap-3">
                 <select 
                    value={selectedAgent} 
                    onChange={(e) => setSelectedAgent(e.target.value)}
                    className="bg-[#161a23] text-[10px] font-bold text-blue-400 border border-white/10 px-3 py-1.5 rounded-full outline-none uppercase tracking-widest cursor-pointer hover:border-blue-500/50 transition-all"
                 >
                    <option value="koder-pro">Koder Pro (Free)</option>
                    <option value="video-master">Video Master</option>
                    <option value="groq-llama">Groq Llama 3.1</option>
                 </select>
                 <div className="hidden sm:flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"/>
                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Gateway Live</span>
                 </div>
              </div>
           </div>
           <button onClick={() => startNewSession(user.id)} className="text-[10px] font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-2">
              <Plus size={14}/> NEW SESSION
           </button>
        </header>

        {activeTab === 'chat' ? (
          <div className="flex-1 flex flex-col overflow-hidden relative">
             
             {/* MESSAGES */}
             <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-8 scroll-smooth custom-scrollbar">
                {messages.length === 0 && (
                   <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                      <div className="w-20 h-20 bg-blue-600/10 rounded-[2.5rem] flex items-center justify-center border border-blue-600/20">
                         <Bot className="text-blue-500" size={40}/>
                      </div>
                      <div className="space-y-2">
                         <h2 className="text-2xl font-bold text-white tracking-tight italic">"Reci, Kralju..."</h2>
                         <p className="text-sm max-w-xs mx-auto leading-relaxed">Spreman sam. Moje instrukcije i tvoji skillovi su učitani.</p>
                      </div>
                   </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[85%] md:max-w-[70%] p-5 rounded-[2rem] text-sm leading-relaxed shadow-2xl ${
                      m.role === 'user' 
                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-none shadow-blue-900/20' 
                        : 'bg-[#161a23] border border-white/5 text-gray-200 rounded-bl-none shadow-black/50'
                    }`}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {loading && (
                   <div className="flex justify-start animate-pulse">
                      <div className="bg-[#161a23] p-4 rounded-2xl flex items-center gap-2">
                         <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"/>
                         <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"/>
                         <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"/>
                      </div>
                   </div>
                )}
                <div ref={chatEndRef} />
             </div>

             {/* FLOATING INPUT AREA */}
             <div className="p-4 md:p-10 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/90 to-transparent">
                <div className="max-w-4xl mx-auto relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2.5rem] blur opacity-5 group-focus-within:opacity-20 transition duration-1000"></div>
                  
                  <div className="relative flex items-center bg-[#161a23]/90 backdrop-blur-xl border border-white/10 p-2 rounded-[2.5rem] shadow-2xl focus-within:border-blue-500/50 transition-all">
                    <button className="p-4 text-gray-500 hover:text-blue-400 transition-colors"><Mic size={22} /></button>
                    <input 
                      value={input}
                      onChange={(e)=>setInput(e.target.value)}
                      onKeyDown={(e)=>e.key==='Enter' && handleSend()}
                      placeholder="Pošalji poruku tvom AI agentu..." 
                      className="flex-1 bg-transparent border-none p-4 text-sm text-white focus:outline-none placeholder-gray-600" 
                    />
                    <button 
                      onClick={handleSend}
                      disabled={loading || !input}
                      className="p-5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:opacity-50 text-white rounded-full shadow-lg shadow-blue-600/30 transition-all active:scale-90"
                    >
                      <Send size={22} />
                    </button>
                  </div>
                </div>
                <p className="text-center text-[9px] text-gray-700 mt-6 uppercase tracking-[0.5em] font-bold">OpenClaw v2.5 // No-Limit Engine</p>
             </div>
          </div>
        ) : (
          /* --- SETTINGS / SYNC TABS --- */
          <div className="flex-1 p-6 md:p-20 overflow-y-auto max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
             
             {activeTab === 'config' && (
                <div className="bg-[#161a23] p-10 md:p-16 rounded-[3rem] border border-white/5 text-center shadow-3xl">
                   <div className="w-20 h-20 bg-blue-600/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-blue-600/20">
                      <RefreshCw size={40} className={`text-blue-500 ${syncing ? 'animate-spin' : ''}`} />
                   </div>
                   <h2 className="text-3xl font-bold tracking-tighter uppercase mb-4 text-white">Brain Sync</h2>
                   <p className="text-gray-500 mb-10 text-sm leading-relaxed">Poveži najnoviju 'Dušu' (SOUL.md) i sve skillove sa svog privatnog <b>Kralj-backup</b> repoa.</p>
                   <button 
                      onClick={syncBrain}
                      disabled={syncing}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-2xl font-bold text-lg shadow-2xl transition-all active:scale-95 disabled:opacity-50 w-full md:w-auto"
                   >
                      {syncing ? "Sinkronizujem..." : "SYNC FROM GITHUB"}
                   </button>
                </div>
             )}

             {activeTab === 'agents' && (
                <div className="bg-[#161a23] p-10 md:p-16 rounded-[3rem] border border-white/5 text-center shadow-3xl">
                   <div className="w-20 h-20 bg-purple-600/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-purple-600/20">
                      <Layers size={40} className={`text-purple-500 ${syncing ? 'animate-spin' : ''}`} />
                   </div>
                   <h2 className="text-3xl font-bold tracking-tighter uppercase mb-4 text-white">Agent Hub Sync</h2>
                   <p className="text-gray-500 mb-10 text-sm leading-relaxed">Učitaj svoje besplatne agente (bez API ključeva) sa <b>moji-agenti</b> repoa.</p>
                   <button 
                      onClick={syncAgentHub}
                      disabled={syncing}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-12 py-4 rounded-2xl font-bold text-lg shadow-2xl transition-all active:scale-95 disabled:opacity-50 w-full md:w-auto"
                   >
                      {syncing ? "Učitavam Hub..." : "SYNC AGENT REPO"}
                   </button>
                </div>
             )}

             {activeTab === 'security' && (
                <div className="space-y-6">
                   <h2 className="text-3xl font-bold text-white flex items-center gap-3"><Shield className="text-red-500"/> Firewall Control</h2>
                   <div className="bg-[#161a23] p-8 rounded-[2.5rem] border border-white/5">
                      <div className="flex items-center justify-between">
                         <div>
                            <h3 className="font-bold">Owner Access</h3>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                         </div>
                         <div className="bg-green-500/10 text-green-500 px-4 py-1.5 rounded-full text-[10px] font-bold border border-green-500/20">MASTER STATUS</div>
                      </div>
                   </div>
                </div>
             )}
          </div>
        )}
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
}
