export const dynamic = 'force-dynamic';

'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Bot, Send, RefreshCw, Key, ShieldCheck, LogOut, 
  MessageSquare, Plus, Zap, Menu, X, Mic, Layers 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function OpenClawOS() {
  const [activeTab, setActiveTab] = useState('chat');
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [convId, setConvId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('koder-pro');
  const [availableAgents, setAvailableAgents] = useState<any[]>([]);
  
  const chatEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadAgents(session.user.id);
        fetchConversations(session.user.id);
      }
    });
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadAgents = async (uid: string) => {
    const { data } = await supabase.from('system_settings').select('value').like('key', 'agent_config_%');
    if (data && data.length > 0) {
      const agents = data.map(d => JSON.parse(d.value));
      setAvailableAgents(agents);
      setSelectedAgent(agents[0].id);
    } else {
      setAvailableAgents([{ id: 'koder-pro', name: 'Koder Pro (Free)' }]);
    }
  };

  const fetchConversations = async (uid: string) => {
    const { data } = await supabase.from('conversations').select('*').eq('user_id', uid).order('created_at', { ascending: false });
    if (data && data.length > 0) {
      setConversations(data);
      setConvId(data[0].id);
      fetchMessages(data[0].id);
    } else {
      startNewSession(uid);
    }
  };

  const fetchMessages = async (id: string) => {
    const { data } = await supabase.from('chat_messages').select('*').eq('conversation_id', id).order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  const startNewSession = async (uid: string) => {
    const { data } = await supabase.from('conversations').insert([{ user_id: uid, title: 'Nova Sesija' }]).select().single();
    if (data) {
      setConvId(data.id);
      setConversations(prev => [data, ...prev]);
      setMessages([]);
    }
  };

  const handleSend = async () => {
    if (!input || !convId || !user) return;
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
    } catch (e) { toast.error("Gateway offline."); }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="h-screen bg-[#0b0e14] flex flex-col items-center justify-center p-6 text-center">
        <Bot size={80} className="text-blue-500 mb-8 animate-pulse" />
        <h1 className="text-4xl font-bold mb-4 tracking-tighter">OPENCLAW OS</h1>
        <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })} className="bg-white text-black px-10 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-all">UĐI KAO KRALJ 👑</button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0b0e14] overflow-hidden">
      {/* SIDEBAR */}
      <aside className={`fixed md:relative z-50 w-72 h-full bg-[#11141b]/80 backdrop-blur-2xl border-r border-white/5 flex flex-col p-6 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-3 text-white font-bold text-xl tracking-tighter">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg"><Bot size={22}/></div>
            <span>OPENCLAW</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500"><X /></button>
        </div>

        <button onClick={() => startNewSession(user.id)} className="w-full bg-white text-black py-4 rounded-2xl font-bold mb-8 shadow-xl hover:bg-gray-100 transition-all">+ New Session</button>

        <nav className="flex-1 space-y-2 overflow-y-auto">
          <button onClick={() => setActiveTab('chat')} className={`w-full flex items-center gap-3 p-3.5 rounded-2xl text-sm transition-all ${activeTab === 'chat' ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'text-gray-500'}`}>
            <MessageSquare size={18}/> Chat
          </button>
          <button onClick={() => setActiveTab('agents')} className={`w-full flex items-center gap-3 p-3.5 rounded-2xl text-sm transition-all ${activeTab === 'agents' ? 'bg-white/5 text-white' : 'text-gray-500'}`}>
            <Layers size={18}/> Agent Hub
          </button>
        </nav>

        <button onClick={() => supabase.auth.signOut()} className="mt-auto p-4 border-t border-white/5 text-xs text-gray-600 hover:text-red-500 flex items-center justify-between">
          <span>{user.email}</span><LogOut size={14}/>
        </button>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col relative bg-[#0b0e14]">
        <header className="h-16 border-b border-white/5 flex items-center px-8 justify-between bg-[#0b0e14]/80 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-gray-400"><Menu size={20}/></button>
            <select value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)} className="bg-[#161a23] text-[10px] font-bold text-blue-400 border border-white/10 px-4 py-2 rounded-full outline-none uppercase tracking-widest cursor-pointer hover:border-blue-500/40 transition-all">
              {availableAgents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/><span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Gateway Live</span></div>
        </header>

        {activeTab === 'chat' ? (
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 scroll-smooth custom-scrollbar">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-40">
                  <Bot size={60} className="text-blue-500 mb-4 animate-bounce"/>
                  <h2 className="text-3xl font-bold tracking-tighter">"Reci Kralju..."</h2>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] p-5 rounded-[2rem] text-sm shadow-2xl ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-[#1c212c] border border-white/5 text-gray-100'}`}>{m.content}</div>
                </div>
              ))}
              {loading && <div className="text-blue-500 text-[10px] font-mono animate-pulse">PROCESIRAM...</div>}
              <div ref={chatEndRef} />
            </div>
            <div className="p-6 md:p-10 bg-gradient-to-t from-[#0b0e14] to-transparent">
              <div className="max-w-4xl mx-auto bg-[#161a23]/90 backdrop-blur-xl border border-white/10 p-2 rounded-[2.5rem] flex items-center shadow-3xl">
                <button className="p-4 text-gray-500"><Mic size={22} /></button>
                <input value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>e.key==='Enter' && handleSend()} placeholder="Poruka za Kralja..." className="flex-1 bg-transparent border-none p-4 text-sm text-white focus:outline-none" />
                <button onClick={handleSend} className="p-5 bg-blue-600 rounded-full hover:bg-blue-500 transition-all"><Send size={22} /></button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-20 text-center">
            <div className="bg-[#161a23] p-16 rounded-[4rem] border border-white/5 shadow-3xl">
              <RefreshCw size={60} className="mx-auto text-blue-500 mb-8 opacity-30" />
              <h2 className="text-3xl font-bold uppercase mb-4">Agent Hub</h2>
              <button onClick={loadAgents} className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-3xl font-bold text-xl shadow-2xl transition-all active:scale-95">SYNC FROM DATABASE</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
