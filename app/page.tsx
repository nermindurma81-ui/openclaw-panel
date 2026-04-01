'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Bot, Send, RefreshCw, Key, MessageSquare, Plus, Zap, Menu, X, Mic, Paperclip, Globe, Cpu, Layers, LogOut } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function KraljOS() {
  const [view, setView] = useState<'setup' | 'main'>('setup');
  const [activeTab, setActiveTab] = useState('chat');
  const [user, setUser] = useState<any>(null);
  const [instances, setInstances] = useState<any[]>([]);
  const [activeInstance, setActiveInstance] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [repo, setRepo] = useState('nermindurma81-ui/Kralj-backup');

  const chatEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadInstances(session.user.id);
      }
    });
  }, []);

  const loadInstances = async (uid: string) => {
    const { data } = await supabase.from('instances').select('*').eq('user_id', uid);
    if (data && data.length > 0) {
      setInstances(data);
      setActiveInstance(data[0]);
      setView('main');
      fetchHistory(data[0].id);
    }
  };

  const fetchHistory = async (instId: string) => {
    const { data: conv } = await supabase.from('conversations').select('id').eq('instance_id', instId).single();
    if (conv) {
      const { data: msgs } = await supabase.from('chat_messages').select('*').eq('conversation_id', conv.id).order('created_at', { ascending: true });
      if (msgs) setMessages(msgs);
    }
  };

  const createInstance = async () => {
    setLoading(true);
    try {
      const { data: inst } = await supabase.from('instances').insert([{ user_id: user.id, name: `Kralj Instance`, repo_url: repo }]).select().single();
      await supabase.from('conversations').insert([{ instance_id: inst.id, user_id: user.id }]);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_GATEWAY_URL}/api/chat`, {
        method: 'POST',
        body: JSON.stringify({ action: 'sync', repo, userId: user.id, instanceId: inst.id })
      });
      
      if (res.ok) {
        toast.success("OS Podignut!");
        window.location.reload();
      }
    } catch (e) { toast.error("Greška pri instalaciji."); }
    setLoading(false);
  };

  const handleSend = async () => {
    if (!input || loading) return;
    const msg = input; setInput(''); setLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: msg }]);

    const { data: conv } = await supabase.from('conversations').select('id').eq('instance_id', activeInstance.id).single();

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_GATEWAY_URL}/api/chat`, {
        method: 'POST',
        body: JSON.stringify({ message: msg, userId: user.id, conversationId: conv?.id, instanceId: activeInstance.id, agentId: 'koder-pro' })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch (e) { toast.error("Gateway Offline"); }
    setLoading(false);
  };

  if (!user) return <div className="h-screen bg-[#0a0c10] flex items-center justify-center"><button onClick={() => supabase.auth.signInAnonymously()} className="bg-white text-black px-12 py-5 rounded-2xl font-bold">BYPASS LOGIN 👑</button></div>;

  if (view === 'setup') return (
    <div className="h-screen bg-[#0a0c10] flex items-center justify-center p-6">
      <div className="bg-[#12161f] border border-white/10 w-full max-w-xl p-10 rounded-[2.5rem] shadow-3xl space-y-8 animate-in zoom-in-95">
        <h2 className="text-3xl font-bold">New Instance</h2>
        <div className="p-6 rounded-3xl bg-blue-600/10 border-2 border-blue-600 flex items-center gap-4">
          <Bot className="text-red-500" size={40}/>
          <div><p className="font-bold text-white uppercase">OpenClaw Engine</p><p className="text-xs text-gray-500">v2.5.0 Production Ready</p></div>
        </div>
        <input value={repo} onChange={(e)=>setRepo(e.target.value)} className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl outline-none text-blue-400 font-mono text-sm" />
        <button onClick={createInstance} disabled={loading} className="w-full bg-white text-black py-5 rounded-2xl font-bold text-lg disabled:opacity-50">
          {loading ? "PROVISIONING..." : "CREATE & SYNC OS"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0b0e14] text-[#e2e8f0] font-sans overflow-hidden">
      <Toaster />
      <aside className={`fixed md:relative z-50 w-72 h-full bg-[#0e121a] border-r border-white/5 flex flex-col transition-all ${isSidebarOpen ? 'translate-x-0 shadow-[0_0_50px_#000]' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-8 flex items-center gap-3 border-b border-white/5"><Bot className="text-red-500" size={24}/><span className="font-bold tracking-widest uppercase">Kralj OS</span></div>
        <nav className="flex-1 p-4 space-y-1">
          {['Chat', 'Models', 'Tokens'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab.toLowerCase())} className={`w-full text-left p-4 rounded-2xl text-xs font-bold transition-all ${activeTab === tab.toLowerCase() ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>
              {tab}
            </button>
          ))}
        </nav>
        <button onClick={() => supabase.auth.signOut().then(()=>window.location.reload())} className="p-6 border-t border-white/5 text-[10px] font-bold text-gray-600 hover:text-red-500 flex items-center justify-between">LOGOUT <LogOut size={14}/></button>
      </aside>

      <main className="flex-1 flex flex-col relative min-w-0">
        <header className="h-16 border-b border-white/5 flex items-center px-8 justify-between bg-[#0b0e14]/80 backdrop-blur-xl z-40">
           <Menu onClick={() => setIsSidebarOpen(true)} className="md:hidden text-gray-400 cursor-pointer"/>
           <div className="flex items-center gap-3"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"/><span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Instance: {activeInstance?.name}</span></div>
        </header>

        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="flex-1 overflow-y-auto p-4 md:p-12 space-y-8 scroll-smooth custom-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                <div className={`max-w-[85%] md:max-w-[70%] p-5 rounded-[2rem] text-sm leading-relaxed shadow-2xl ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-[#161a23] border border-white/5 text-gray-100 rounded-bl-none'}`}>
                  <pre className="whitespace-pre-wrap font-sans">{m.content}</pre>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-6 md:p-10 bg-gradient-to-t from-[#0b0e14] to-transparent">
            <div className="max-w-4xl mx-auto relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2.5rem] blur opacity-10 transition group-focus-within:opacity-30"></div>
              <div className="relative flex items-center bg-[#161a23]/95 backdrop-blur-xl border border-white/10 p-2 rounded-[2.5rem] shadow-3xl">
                <label className="p-4 text-gray-500 hover:text-blue-400 cursor-pointer"><Paperclip size={20}/><input type="file" className="hidden" /></label>
                <input value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>e.key==='Enter' && handleSend()} placeholder="Ask Kralj..." className="flex-1 bg-transparent border-none p-4 text-sm text-white focus:outline-none" />
                <button onClick={handleSend} className="p-5 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg active:scale-90">{loading ? <RefreshCw className="animate-spin" size={20}/> : <Send size={20}/>}</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
