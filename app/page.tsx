'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Bot, Send, RefreshCw, Key, LogOut, MessageSquare, Plus, Menu, Mic } from 'lucide-react';

export default function KraljOS() {
  const [activeTab, setActiveTab] = useState('chat');
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [convId, setConvId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user);
      if (session?.user) startNewSession(session.user.id);
    });
  }, []);

  const startNewSession = async (uid: string) => {
    const { data } = await supabase.from('conversations').insert([{ user_id: uid, title: 'Nova Sesija' }]).select().single();
    setConvId(data.id);
    setMessages([]);
  };

  const handleSend = async () => {
    if (!input || !convId) return;
    const msg = input; setInput(''); setLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    const res = await fetch(`${process.env.NEXT_PUBLIC_GATEWAY_URL}/api/chat`, {
      method: 'POST',
      body: JSON.stringify({ message: msg, userId: user.id, conversationId: convId })
    });
    const data = await res.json();
    setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    setLoading(false);
  };

  if (!user) return <div className="h-screen flex items-center justify-center bg-[#0b0e14]"><button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })} className="bg-white text-black px-10 py-4 rounded-2xl font-bold">UĐI U OPENCLAW 👑</button></div>;

  return (
    <div className="flex h-screen bg-[#0b0e14] overflow-hidden">
      <aside className="w-72 h-full gensee-glass flex flex-col p-6 hidden md:flex">
        <div className="flex items-center gap-3 mb-10"><div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg"><Bot className="text-white"/></div><span className="text-xl font-bold tracking-tighter text-white">OPENCLAW</span></div>
        <button onClick={() => startNewSession(user.id)} className="bg-white text-black w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 mb-8 shadow-xl"><Plus size={18}/> New Session</button>
        <nav className="flex-1 space-y-1">
          <button onClick={() => setActiveTab('chat')} className={`w-full text-left p-3.5 rounded-2xl text-sm ${activeTab === 'chat' ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'text-gray-500'}`}><MessageSquare size={18} className="inline mr-3"/> Chat</button>
          <button onClick={() => setActiveTab('sync')} className="w-full text-left p-3.5 rounded-2xl text-gray-500 hover:bg-white/5"><RefreshCw size={18} className="inline mr-3"/> Sync Brain</button>
        </nav>
        <button onClick={() => supabase.auth.signOut()} className="mt-auto p-4 border-t border-white/5 text-xs text-gray-600 hover:text-red-500 flex items-center justify-between"><span>{user.email}</span><LogOut size={14}/></button>
      </aside>

      <main className="flex-1 flex flex-col relative">
        <header className="h-16 border-b border-white/5 flex items-center px-8 bg-[#0b0e14]/80 backdrop-blur-xl sticky top-0 z-40"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-3"/><span className="text-[10px] font-mono text-gray-500 uppercase">Kralj Engine v2.5 Online</span></header>
        {activeTab === 'chat' ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 scroll-smooth">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[80%] p-5 rounded-[2rem] text-sm shadow-2xl ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-[#1c212c] border border-white/5 text-gray-100'}`}>{m.content}</div></div>
                ))}
                {loading && <div className="text-blue-500 text-[10px] font-mono animate-pulse">KRALJ PROCESIRA...</div>}
            </div>
            <div className="p-6 md:p-10 bg-gradient-to-t from-[#0b0e14] to-transparent">
                <div className="max-w-4xl mx-auto input-container p-2 flex items-center shadow-3xl">
                  <button className="p-4 text-gray-500"><Mic size={22} /></button>
                  <input value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>e.key==='Enter' && handleSend()} placeholder="Poruka za Kralja..." className="flex-1 bg-transparent border-none p-4 text-sm text-white focus:outline-none" />
                  <button onClick={handleSend} className="p-5 bg-blue-600 rounded-full hover:bg-blue-500 transition-all"><Send size={22} /></button>
                </div>
            </div>
          </div>
        ) : (
          <div className="p-20 text-center"><h2 className="text-4xl font-bold uppercase mb-8">System Sync</h2><button onClick={async () => { setLoading(true); await fetch(`${process.env.NEXT_PUBLIC_GATEWAY_URL}/api/system/sync`, { method: 'POST', body: JSON.stringify({ userId: user.id }) }); setLoading(false); alert("Uspješno!"); }} className="bg-blue-600 px-16 py-5 rounded-3xl font-bold text-xl shadow-2xl transition-all">SYNC FROM GITHUB</button></div>
        )}
      </main>
    </div>
  );
}
