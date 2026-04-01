'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Bot, Send, RefreshCw, Key, MessageSquare, Plus, Zap, 
  Menu, X, Mic, Paperclip, Globe, Cpu, Layers, Terminal, 
  Info, Smartphone, Download, Upload, LogOut, CheckCircle2,
  Activity, ShieldCheck, Clock
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function OpenClawOS() {
  // --- GAZDA IDENTITET (Nema provjere, ti si Gazda) ---
  const ADMIN_ID = '00000000-0000-0000-0000-000000000000';
  const [user, setUser] = useState<any>(null);
  
  // --- OS STATE ---
  const [view, setView] = useState<'auth' | 'setup' | 'provisioning' | 'main'>('auth');
  const [activeTab, setActiveTab] = useState('welcome');
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [repo, setRepo] = useState('nermindurma81-ui/Kralj-backup');
  const [instanceName, setInstanceName] = useState(`OpenClaw Instance Created at ${new Date().toLocaleDateString()}`);
  const [selectedAgent, setSelectedAgent] = useState('koder-pro');

  const chatEndRef = useRef<null | HTMLDivElement>(null);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // --- FUNKCIJE KOJE STVARNO RADE ---

  const handleFullBypass = () => {
    setUser({ id: ADMIN_ID, email: 'nermindurma81@gmail.com' });
    setView('setup'); // Odmah te vodi na tvoju Sliku br. 2
    toast.success("Vrata su otvorena, Gazda! 👑");
  };

  const runRealProvisioning = async () => {
    setLoading(true);
    setView('provisioning'); // Tvoja Slika br. 5
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_GATEWAY_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync', repo: repo, userId: ADMIN_ID })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Sistem sinkronizovan!");
        setView('main'); // Tvoja Slika br. 1
      } else { throw new Error(data.error); }
    } catch (e: any) {
      toast.error("Greška: " + e.message);
      setView('setup');
    } finally { setLoading(false); }
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
          userId: ADMIN_ID, 
          conversationId: 'session-master', 
          agentId: selectedAgent 
        })
      });
      const data = await res.json();
      if (data.text) setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch (e) { 
      toast.error("Gateway Offline"); 
      setMessages(prev => [...prev, { role: 'assistant', content: "⚠️ Gateway ne odgovara. Provjeri Railway Variables." }]);
    }
    setLoading(false);
  };

  // --- UI KOMPONENTE (Gensee Crate Mirror) ---

  if (view === 'auth') return (
    <div className="h-screen bg-[#0b0e14] flex flex-col items-center justify-center p-6 text-center space-y-8">
      <div className="w-24 h-24 bg-blue-600/10 rounded-[2.5rem] flex items-center justify-center border border-blue-600/20 animate-pulse shadow-[0_0_50px_rgba(37,99,235,0.1)]">
        <Bot size={50} className="text-blue-500" />
      </div>
      <h1 className="text-4xl font-bold tracking-tighter text-white uppercase">OpenClaw OS</h1>
      <button onClick={handleFullBypass} className="bg-white text-black px-12 py-5 rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)] active:scale-95">
        UĐI KAO GAZDA 👑
      </button>
      <p className="text-gray-600 text-[10px] uppercase tracking-[0.4em] font-bold">Encrypted Production Environment</p>
    </div>
  );

  if (view === 'setup') return (
    <div className="h-screen bg-[#0a0c10] flex items-center justify-center p-4 md:p-10">
      <div className="bg-[#12161f] border border-white/10 w-full max-w-xl p-8 rounded-[2.5rem] shadow-3xl space-y-8 animate-in zoom-in-95 duration-500">
        <div className="flex justify-between items-center"><h2 className="text-2xl font-bold tracking-tighter">New Instance</h2><X className="text-gray-600"/></div>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-blue-600/10 border-2 border-blue-600 flex flex-col items-center gap-2">
            <Bot className="text-red-500" size={24}/><span className="text-[10px] font-bold">OpenClaw</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center gap-2 opacity-30">
            <Bot className="text-orange-400" size={24}/><span className="text-[10px] font-bold">NanoBot</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center gap-2 opacity-30">
            <Bot className="text-purple-400" size={24}/><span className="text-[10px] font-bold">ComfyUI</span>
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-1"><label className="text-[10px] font-bold text-gray-600 uppercase ml-3 tracking-widest">Instance Name</label>
          <input value={instanceName} onChange={(e)=>setInstanceName(e.target.value)} className="w-full bg-black/20 border border-white/5 p-4 rounded-xl outline-none text-sm" /></div>
          <div className="space-y-1"><label className="text-[10px] font-bold text-gray-600 uppercase ml-3 tracking-widest">GitHub Brain Repo</label>
          <input value={repo} onChange={(e)=>setRepo(e.target.value)} className="w-full bg-black/40 border border-white/5 p-4 rounded-xl outline-none text-blue-400 font-mono text-xs" /></div>
          <button onClick={runRealProvisioning} disabled={loading} className="w-full bg-white text-black py-4 rounded-xl font-bold text-lg hover:bg-gray-200 active:scale-95 transition-all">Create Instance</button>
        </div>
      </div>
    </div>
  );

  if (view === 'provisioning') return (
    <div className="h-screen bg-[#0a0c10] flex flex-col items-center justify-center p-10 space-y-10">
      <div className="w-24 h-24 border-4 border-blue-600 border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(59,130,246,0.2)]"></div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tighter uppercase">Provisioning Resources...</h2>
        <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed italic">Instaliram Kralja. Ovo je stvarni proces sinkronizacije baze podataka i GitHub-a.</p>
      </div>
      <div className="w-full max-w-xs space-y-4 bg-black/20 p-8 rounded-3xl border border-white/5">
         <div className="flex items-center gap-3 text-xs text-green-500 font-bold"><CheckCircle2 size={16}/> Environment ready</div>
         <div className="flex items-center gap-3 text-xs text-blue-400 font-bold animate-pulse"><Activity size={16}/> Fetching soul from GitHub...</div>
         <div className="flex items-center gap-3 text-xs text-gray-600"><Clock size={16}/> Finalizing system rules...</div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0b0e14] text-[#e2e8f0] font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className={`fixed md:relative z-50 w-72 h-full bg-[#0e121a] border-r border-white/5 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-8 flex items-center gap-3 border-b border-white/5">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-900/40"><Bot className="text-white" size={18}/></div>
          <span className="font-bold tracking-widest uppercase text-xs">OpenClaw OS</span>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          <p className="text-[10px] font-bold text-gray-600 uppercase px-4 py-4 tracking-[0.3em]">Settings</p>
          {[
            { id: 'chat', icon: MessageSquare, label: 'Welcome' },
            { id: 'channels', icon: Smartphone, label: 'Channels' },
            { id: 'models', icon: Cpu, label: 'Models' },
            { id: 'skills', icon: Layers, label: 'Skills' },
            { id: 'control', icon: Terminal, label: 'OS Control' },
            { id: 'debug', icon: Info, label: 'Debug Info' },
          ].map(i => (
            <button key={i.id} onClick={() => setActiveTab(i.id)} className={`w-full flex items-center gap-3 p-4 rounded-2xl text-xs font-bold transition-all ${activeTab === i.id ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}>
              <i.icon size={18}/> {i.label}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-white/5 text-[10px] font-bold text-gray-600 flex items-center justify-between">
          <span className="text-green-500 animate-pulse">● LIVE SYSTEM</span>
          <button onClick={()=>window.location.reload()}><RefreshCw size={14}/></button>
        </div>
      </aside>

      {/* MAIN VIEW */}
      <main className="flex-1 flex flex-col relative min-w-0 bg-[#0b0e14]">
        <header className="h-16 border-b border-white/5 flex items-center px-8 justify-between bg-[#0b0e14]/80 backdrop-blur-xl z-40">
           <Menu onClick={() => setIsSidebarOpen(true)} className="md:hidden text-gray-400 cursor-pointer"/>
           <div className="flex items-center gap-4">
              <select value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)} className="bg-[#161a23] text-[10px] font-bold text-blue-400 border border-white/10 px-4 py-2 rounded-full outline-none uppercase tracking-widest cursor-pointer hover:border-blue-500/50 transition-all">
                <option value="koder-pro">Koder Pro (Free)</option>
                <option value="groq-llama">Groq Llama 3.3</option>
              </select>
           </div>
           <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest hidden sm:block">2026.3.8-GENSEE-OS</span>
        </header>

        {/* WINDOW VIEW (Tvoj interfejs sa slika) */}
        <div className="flex-1 flex flex-col overflow-hidden relative p-4 md:p-8">
           <div className="bg-[#12161f] border border-white/10 flex-1 flex flex-col rounded-3xl shadow-3xl overflow-hidden max-w-5xl mx-auto w-full relative">
              
              {/* MACOS DOTS */}
              <div className="h-12 bg-black/20 border-b border-white/5 flex items-center px-5 gap-2 shrink-0">
                 <div className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-[0_0_8px_rgba(255,95,86,0.4)]"/>
                 <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"/>
                 <div className="w-3 h-3 rounded-full bg-[#27c93f]"/>
                 <div className="flex-1 text-center text-[10px] font-bold text-gray-500 uppercase mr-10">{instanceName}</div>
              </div>

              {/* WINDOW CONTENT */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                 {activeTab === 'chat' && (
                    <div className="space-y-6">
                       {messages.map((m, i) => (
                         <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                            <div className={`max-w-[85%] p-5 rounded-[2rem] text-sm leading-relaxed shadow-2xl ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-[#1a1f2b] border border-white/5 text-gray-200'}`}>
                               <pre className="whitespace-pre-wrap font-sans">{m.content}</pre>
                            </div>
                         </div>
                       ))}
                       <div ref={chatEndRef} />
                    </div>
                 )}

                 {activeTab === 'models' && (
                    <div className="space-y-8 animate-in fade-in">
                       <h2 className="text-2xl font-bold tracking-tight">Models Express Setup</h2>
                       <div className="bg-[#1a1f2b] p-8 rounded-3xl border border-white/5 space-y-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold text-gray-500 uppercase ml-2">Default Agent Model</label>
                             <select className="w-full bg-[#0f1219] p-4 rounded-2xl border border-white/10 outline-none text-blue-400 font-bold">
                                <option>Free Large (Qwen based)</option>
                                <option>Groq Llama 3.3 (Fast)</option>
                             </select>
                          </div>
                          {['OpenAI Models', 'Anthropic Models', 'Gemini Models'].map(m => (
                             <div key={m} className="bg-black/20 p-4 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-white/5 transition-all cursor-pointer">
                                <span className="font-bold text-sm">{m}</span><Plus size={16} className="text-gray-600"/>
                             </div>
                          ))}
                       </div>
                    </div>
                 )}
                 
                 {activeTab === 'control' && (
                    <div className="space-y-8 animate-in fade-in">
                       <h2 className="text-2xl font-bold tracking-tight">OS Control</h2>
                       <div className="grid grid-cols-2 gap-4">
                          <button onClick={()=>window.location.reload()} className="bg-orange-600/10 border border-orange-500/20 p-10 rounded-[2.5rem] flex flex-col items-center gap-4 hover:bg-orange-500/20 transition-all group">
                             <RefreshCw className="text-orange-500 group-hover:animate-spin" size={40}/>
                             <span className="font-bold uppercase text-xs text-orange-500 tracking-widest">Reload OS</span>
                          </button>
                          <button className="bg-blue-600/10 border border-blue-500/20 p-10 rounded-[2.5rem] flex flex-col items-center gap-4 hover:bg-blue-500/20 transition-all group">
                             <Download className="text-blue-500 group-hover:translate-y-1 transition-transform" size={40}/>
                             <span className="font-bold uppercase text-xs text-blue-500 tracking-widest">Download Config</span>
                          </button>
                       </div>
                    </div>
                 )}
              </div>
           </div>

           {/* INPUT BAR (Gensee style) */}
           <div className="mt-8 max-w-4xl mx-auto w-full px-4 mb-8">
              <div className="bg-[#161a23]/95 backdrop-blur-xl border border-white/10 p-2 rounded-[2.5rem] flex items-center shadow-3xl focus-within:border-blue-500/40 transition-all relative group">
                 <div className="absolute -inset-1 bg-blue-600 rounded-[2.5rem] blur opacity-0 group-focus-within:opacity-10 transition duration-1000"></div>
                 <label className="p-4 text-gray-500 hover:text-blue-400 cursor-pointer transition-colors relative">
                    <Paperclip size={22} /><input type="file" className="hidden" />
                 </label>
                 <input 
                   value={input} 
                   onChange={(e)=>setInput(e.target.value)} 
                   onKeyDown={(e)=>e.key==='Enter' && handleSend()} 
                   placeholder="Message (↵ to send, Shift+↵ for line breaks)" 
                   className="flex-1 bg-transparent border-none p-4 text-sm text-white focus:outline-none placeholder-gray-600 relative" 
                 />
                 <button onClick={handleSend} disabled={loading || !input} className="p-5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-full shadow-lg active:scale-90 transition-all flex items-center justify-center relative">
                   {loading ? <RefreshCw className="animate-spin" size={22}/> : <Send size={22}/>}
                 </button>
              </div>
           </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
}
