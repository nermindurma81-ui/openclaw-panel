'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Bot, Send, RefreshCw, Key, MessageSquare, Plus, Zap, 
  Menu, X, Mic, Paperclip, Globe, Cpu, Layers, Terminal, 
  Info, Smartphone, Download, Upload, LogOut, CheckCircle2,
  Activity, ShieldCheck, Clock, Trash2, ShieldAlert
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function OpenClawOS() {
  // --- AUTH BYPASS (Ti si Gazda) ---
  const ADMIN_ID = '00000000-0000-0000-0000-000000000000';
  const [user, setUser] = useState<any>({ id: ADMIN_ID, email: 'nermindurma81@gmail.com' });
  
  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [view, setView] = useState<'main' | 'provisioning'>('main');

  // --- DATA STATE ---
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [tokens, setTokens] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([{ id: 'koder-pro', name: 'Koder Pro (Free)' }]);
  const [selectedAgent, setSelectedAgent] = useState('koder-pro');
  
  // --- CONFIG STATE ---
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [newToken, setNewToken] = useState('');
  const [newProvider, setNewProvider] = useState('groq');
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const chatEndRef = useRef<null | HTMLDivElement>(null);

  // --- INITIAL LOAD ---
  useEffect(() => {
    fetchHistory();
    fetchTokens();
    loadOllama();
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  // --- DATABASE ACTIONS ---
  const fetchHistory = async () => {
    const { data } = await supabase.from('chat_messages').select('*').order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  const fetchTokens = async () => {
    const { data } = await supabase.from('ai_tokens').select('*');
    if (data) setTokens(data);
  };

  const loadOllama = async () => {
    const { data } = await supabase.from('system_settings').select('value').eq('key', 'ollama_url').single();
    if (data) setOllamaUrl(data.value);
  };

  // --- SYSTEM ACTIONS ---
  const handleSend = async () => {
    if (!input || loading) return;
    const msg = input; setInput(''); setLoading(true);
    const currentFile = fileUrl; setFileUrl(null);
    
    setMessages(prev => [...prev, { role: 'user', content: msg, file_url: currentFile }]);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_GATEWAY_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, userId: ADMIN_ID, agentId: selectedAgent, fileUrl: currentFile, conversationId: 'session-1' })
      });
      const data = await res.json();
      if (data.text) setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch (e) { toast.error("Gateway Offline"); }
    setLoading(false);
  };

  const runSync = async () => {
    setView('provisioning');
    setSyncLogs(["Inicijalizacija...", "Pristup GitHub-u: Kralj-backup..."]);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_GATEWAY_URL}/api/chat`, {
        method: 'POST',
        body: JSON.stringify({ action: 'sync', repo: 'nermindurma81-ui/Kralj-backup', userId: ADMIN_ID })
      });
      const data = await res.json();
      if (data.success) {
        setSyncLogs(prev => [...prev, "✅ SOUL.md učitan", "✅ Skillovi u bazi", "KRALJ JE ONLINE! 👑"]);
        setTimeout(() => setView('main'), 1500);
      }
    } catch (e) { toast.error("Sync failed"); setView('main'); }
  };

  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    toast.loading("Slanje fajla...");
    const { data } = await supabase.storage.from('files').upload(`${Date.now()}-${file.name}`, file);
    if (data) {
      const { data: { publicUrl } } = supabase.storage.from('files').getPublicUrl(data.path);
      setFileUrl(publicUrl);
      toast.dismiss(); toast.success("Zakačeno!");
    }
  };

  // --- RENDERERI ---

  if (view === 'provisioning') return (
    <div className="h-screen bg-[#0a0c10] flex flex-col items-center justify-center p-10 space-y-10">
      <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tighter text-white uppercase italic">Instaliram mozak...</h2>
        <div className="w-64 bg-black/40 border border-white/5 rounded-2xl p-4 font-mono text-[10px] text-blue-400 text-left space-y-1">
          {syncLogs.map((l, i) => <div key={i}>{">"} {l}</div>)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0b0e14] text-[#e2e8f0] font-sans overflow-hidden">
      <Toaster />
      
      {/* SIDEBAR (Gensee Crate Clone) */}
      <aside className={`fixed md:relative z-50 w-72 h-full bg-[#0e121a] border-r border-white/5 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'translate-x-0 shadow-[0_0_50px_#000]' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-8 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-900/40"><Bot size={18} className="text-white"/></div>
             <span className="font-bold tracking-widest uppercase text-xs">OpenClaw OS</span>
          </div>
          <X className="md:hidden text-gray-600" onClick={() => setIsSidebarOpen(false)}/>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          <p className="text-[10px] font-bold text-gray-600 uppercase px-4 py-4 tracking-[0.3em]">Settings</p>
          {[
            { id: 'chat', icon: MessageSquare, label: 'Chat Session' },
            { id: 'channels', icon: Smartphone, label: 'Channels' },
            { id: 'models', icon: Cpu, label: 'Models Setup' },
            { id: 'skills', icon: Layers, label: 'Skills Hub' },
            { id: 'control', icon: Terminal, label: 'OS Control' },
          ].map(item => (
            <button key={item.id} onClick={() => {setActiveTab(item.id); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-3 p-4 rounded-2xl text-xs font-bold transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-gray-500 hover:bg-white/5'}`}>
              <item.icon size={18}/> {item.label}
            </button>
          ))}
        </nav>
        
        <div className="p-6 border-t border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/><span className="text-[10px] font-bold text-gray-500 uppercase">Gazda Mode</span></div>
           <LogOut size={14} className="text-gray-600 hover:text-red-500 cursor-pointer" onClick={() => window.location.reload()}/>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col relative min-w-0 bg-[#0b0e14]">
        
        {/* HEADER BAR */}
        <header className="h-16 border-b border-white/5 flex items-center px-6 justify-between bg-[#0b0e14]/80 backdrop-blur-xl z-40">
           <Menu onClick={() => setIsSidebarOpen(true)} className="md:hidden text-gray-400 cursor-pointer hover:text-white"/>
           <div className="flex items-center gap-4">
              <select value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)} className="bg-[#161a23] text-[10px] font-bold text-blue-400 border border-white/10 px-4 py-2 rounded-full outline-none uppercase tracking-widest cursor-pointer hover:border-blue-500/50 transition-all">
                <option value="koder-pro">Koder Pro (Free)</option>
                <option value="groq-llama">Groq Llama 3.3</option>
                <option value="ollama-local">Ollama Local</option>
              </select>
           </div>
           <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest hidden lg:block">System v2.5 // stable-build</span>
        </header>

        {/* CONTENT WINDOW (Tvoje slike) */}
        <div className="flex-1 flex flex-col overflow-hidden relative p-4 md:p-8">
           <div className="bg-[#12161f] border border-white/10 flex-1 flex flex-col rounded-[1.5rem] shadow-3xl overflow-hidden max-w-5xl mx-auto w-full relative">
              
              {/* MACOS WINDOW DOTS */}
              <div className="h-12 bg-black/20 border-b border-white/5 flex items-center px-5 gap-2 shrink-0">
                 <div className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-[0_0_8px_#ff5f56]"/>
                 <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"/>
                 <div className="w-3 h-3 rounded-full bg-[#27c93f]"/>
                 <div className="flex-1 text-center text-[10px] font-bold text-gray-500 uppercase mr-10 tracking-widest">
                    OpenClaw Instance Control Center
                 </div>
              </div>

              {/* WINDOW SCROLL AREA */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-black/5">
                 
                 {activeTab === 'chat' && (
                    <div className="space-y-6">
                       {messages.length === 0 && (
                          <div className="h-full flex flex-col items-center justify-center opacity-20 text-center py-20">
                             <Bot size={80}/><h2 className="text-2xl font-bold uppercase mt-4">Kralj OS Active</h2>
                          </div>
                       )}
                       {messages.map((m, i) => (
                         <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                            <div className={`max-w-[85%] p-5 rounded-[2rem] text-sm leading-relaxed shadow-2xl ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none shadow-blue-900/20' : 'bg-[#161a23] border border-white/5 text-gray-200 rounded-bl-none shadow-black/50'}`}>
                               {m.file_url && <div className="mb-3 p-3 bg-black/30 rounded-2xl text-[10px] text-blue-300 truncate flex items-center gap-2 font-mono">📎 {m.file_url.split('/').pop()}</div>}
                               <pre className="whitespace-pre-wrap font-sans">{m.content}</pre>
                            </div>
                         </div>
                       ))}
                       <div ref={chatEndRef} />
                    </div>
                 )}

                 {activeTab === 'channels' && (
                    <div className="space-y-8 animate-in fade-in">
                       <h2 className="text-2xl font-bold">Channels Express Setup</h2>
                       <div className="bg-[#1a1f2b] p-8 rounded-3xl border border-white/5 space-y-4">
                          <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5 hover:bg-white/5 transition-all cursor-pointer">
                             <div className="flex items-center gap-4"><div className="p-3 bg-blue-500/20 rounded-xl text-blue-400"><Send size={24}/></div><div className="text-left"><p className="font-bold">Telegram Bot</p><p className="text-xs text-gray-500">Connect via Telegram Bot API</p></div></div>
                             <Plus size={20} className="text-gray-600"/>
                          </div>
                       </div>
                    </div>
                 )}

                 {activeTab === 'models' && (
                    <div className="space-y-8 animate-in fade-in">
                       <h2 className="text-2xl font-bold">Models Express Setup</h2>
                       <div className="bg-[#1a1f2b] p-8 rounded-3xl border border-white/5 space-y-6">
                          <div className="space-y-3">
                             <label className="text-[10px] font-bold text-gray-500 uppercase ml-2 tracking-widest">Local Ollama URL</label>
                             <input value={ollamaUrl} onChange={(e)=>setOllamaUrl(e.target.value)} placeholder="http://localhost:11434" className="w-full bg-[#0f1219] p-4 rounded-2xl border border-white/10 text-xs outline-none focus:border-blue-500 transition-all font-mono" />
                             <button onClick={async () => { await supabase.from('system_settings').upsert({key:'ollama_url', value: ollamaUrl}); toast.success("Spremljeno!"); }} className="w-full bg-blue-600 p-4 rounded-2xl font-bold text-xs shadow-lg hover:bg-blue-500 active:scale-95 transition-all">SPREMI KONFIGURACIJU</button>
                          </div>
                          <div className="pt-6 border-t border-white/5 space-y-2">
                             <p className="text-[10px] font-bold text-gray-600 uppercase mb-4 px-2">External Providers</p>
                             {['OpenAI Models', 'Anthropic Models', 'Gemini Models'].map(m => (
                                <div key={m} className="bg-black/20 p-4 rounded-2xl border border-white/5 flex items-center justify-between opacity-50"><span className="font-bold text-xs">{m}</span><Key size={14}/></div>
                             ))}
                          </div>
                       </div>
                    </div>
                 )}

                 {activeTab === 'control' && (
                    <div className="space-y-8 animate-in fade-in">
                       <h2 className="text-2xl font-bold">OpenClaw Control</h2>
                       <div className="grid grid-cols-2 gap-4">
                          <button onClick={()=>window.location.reload()} className="bg-orange-600/10 border border-orange-500/20 p-10 rounded-[2.5rem] flex flex-col items-center gap-4 hover:bg-orange-500/20 transition-all group">
                             <RefreshCw className="text-orange-500 group-hover:animate-spin" size={40}/>
                             <span className="font-bold uppercase text-[10px] text-orange-500 tracking-widest">Reload Instance</span>
                          </button>
                          <button onClick={runSync} className="bg-blue-600/10 border border-blue-500/20 p-10 rounded-[2.5rem] flex flex-col items-center gap-4 hover:bg-blue-500/20 transition-all group text-blue-500">
                             <RefreshCw size={40} className="group-hover:animate-spin"/>
                             <span className="font-bold uppercase text-[10px] tracking-widest text-blue-500">Force Brain Sync</span>
                          </button>
                       </div>
                    </div>
                 )}
              </div>
           </div>

           {/* FLOATING INPUT BAR (Gensee Style) */}
           <div className="mt-8 max-w-4xl mx-auto w-full px-4 mb-8">
              <div className="bg-[#161a23]/95 backdrop-blur-2xl border border-white/10 p-2 rounded-[2.5rem] flex items-center shadow-3xl focus-within:border-blue-500/40 transition-all relative group">
                 {/* Subtle Shadow/Glow Effect */}
                 <div className="absolute -inset-1 bg-blue-600 rounded-[2.5rem] blur opacity-0 group-focus-within:opacity-10 transition duration-1000"></div>
                 
                 {/* File Upload Icon */}
                 <label className="p-4 text-gray-500 hover:text-blue-400 cursor-pointer transition-colors relative">
                    <Paperclip size={22} />
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                 </label>

                 {/* Text Input */}
                 <input 
                   value={input} 
                   onChange={(e)=>setInput(e.target.value)} 
                   onKeyDown={(e)=>e.key==='Enter' && handleSend()} 
                   placeholder="Message (↵ to send, Shift+↵ for line breaks, paste images)" 
                   className="flex-1 bg-transparent border-none p-4 text-sm text-white focus:outline-none placeholder-gray-600 relative" 
                 />

                 {/* Send Button */}
                 <button onClick={handleSend} disabled={loading || !input} className="p-5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-full shadow-lg active:scale-90 transition-all flex items-center justify-center relative">
                   {loading ? <RefreshCw className="animate-spin" size={22}/> : <Send size={22}/>}
                 </button>
              </div>
           </div>
        </div>
      </main>

      {/* GLOBAL SCROLLBAR STYLES */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
        @keyframes message-in { from { opacity: 0; transform: translateY(15px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .animate-message { animation: message-in 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
      `}</style>
    </div>
  );
}
