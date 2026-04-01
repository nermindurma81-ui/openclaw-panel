'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Bot, Send, RefreshCw, Key, MessageSquare, Plus, Zap, Menu, X, Mic, Layers, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OpenClawOS() {
  // --- ADMIN BYPASS ---
  const [user] = useState<any>({ id: '00000000-0000-0000-0000-000000000000', email: 'nermindurma81@gmail.com' });
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [convId] = useState('admin-session-1');
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('koder-pro');

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
      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-[#0b0e14] text-[#e2e8f0] font-sans overflow-hidden">
      {/* SIDEBAR */}
      <aside className="hidden md:flex w-72 h-full bg-[#11141b] border-r border-white/5 flex-col p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Bot className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold tracking-tighter text-white uppercase">OpenClaw</span>
        </div>
        <nav className="flex-1 space-y-2">
          <button onClick={() => setActiveTab('chat')} className={`w-full text-left p-4 rounded-2xl flex items-center gap-3 transition-all ${activeTab === 'chat' ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-500 hover:bg-white/5'}`}>
            <MessageSquare size={18}/> Chat
          </button>
          <button onClick={() => setActiveTab('config')} className={`w-full text-left p-4 rounded-2xl flex items-center gap-3 transition-all ${activeTab === 'config' ? 'bg-white/10 text-white' : 'text-gray-500 hover:bg-white/5'}`}>
            <RefreshCw size={18}/> Sync Brain
          </button>
        </nav>
        <div className="p-4 bg-black/20 rounded-2xl border border-white/5 mt-auto">
          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Superuser Mode</p>
          <p className="text-xs truncate text-gray-400">{user.email}</p>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col relative bg-[#0b0e14]">
        <header className="h-16 border-b border-white/5 flex items-center px-8 justify-between bg-[#0b0e14]/80 backdrop-blur-xl">
          <select value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)} className="bg-[#161a23] text-xs font-bold text-blue-400 border border-white/10 px-4 py-2 rounded-full outline-none">
            <option value="koder-pro">Koder Pro (Free)</option>
          </select>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"/>
            <span className="text-[10px] font-mono text-gray-500 uppercase">Gateway Live</span>
          </div>
        </header>

        {activeTab === 'chat' ? (
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 scroll-smooth">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] md:max-w-[70%] p-5 rounded-[2rem] text-sm leading-relaxed shadow-2xl ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none shadow-blue-900/20' : 'bg-[#161a23] border border-white/5 text-gray-200 rounded-bl-none shadow-black/50'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && <div className="text-blue-500 text-[10px] font-mono animate-pulse uppercase tracking-widest">Kralj procesira...</div>}
            </div>

            <div className="p-4 md:p-10 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/90 to-transparent">
              <div className="max-w-4xl mx-auto relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2.5rem] blur opacity-10 group-focus-within:opacity-20 transition duration-1000"></div>
                <div className="relative flex items-center bg-[#161a23]/90 backdrop-blur-xl border border-white/10 p-2 rounded-[2.5rem] shadow-3xl">
                  <button className="p-4 text-gray-500 hover:text-blue-400"><Mic size={22} /></button>
                  <input value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>e.key==='Enter' && handleSend()} placeholder="Gazda, reci šta treba..." className="flex-1 bg-transparent border-none p-4 text-sm text-white focus:outline-none placeholder-gray-600" />
                  <button onClick={handleSend} className="p-5 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-600/30 transition-all active:scale-90"><Send size={22} /></button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-20 text-center">
            <div className="bg-[#161a23] p-16 rounded-[4rem] border border-white/5 shadow-3xl max-w-2xl mx-auto">
              <RefreshCw size={60} className="mx-auto text-blue-500 mb-8 opacity-30" />
              <h2 className="text-3xl font-bold uppercase mb-4 tracking-tighter">Brain Sync</h2>
              <button onClick={() => alert("Syncing...")} className="bg-blue-600 hover:bg-blue-700 text-white px-16 py-5 rounded-3xl font-bold text-xl shadow-2xl transition-all active:scale-95">SYNC FROM GITHUB</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
