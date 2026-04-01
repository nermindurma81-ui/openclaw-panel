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
  // --- SYSTEM STATE ---
  const [view, setView] = useState<'auth' | 'setup' | 'provisioning' | 'main'>('auth');
  const [activeTab, setActiveTab] = useState('welcome');
  const [user, setUser] = useState<any>(null);
  
  // --- DATA STATE ---
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [repo, setRepo] = useState('nermindurma81-ui/Kralj-backup');
  const [instanceName, setInstanceName] = useState(`OpenClaw Instance ${new Date().toLocaleDateString()}`);
  const [selectedAgent, setSelectedAgent] = useState('koder-pro');
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const chatEndRef = useRef<null | HTMLDivElement>(null);

  // 1. INICIJALIZACIJA I BYPASS PROVJERA
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        checkIfProvisioned();
      }
    };
    checkUser();
  }, []);

  const checkIfProvisioned = async () => {
    const { data } = await supabase.from('system_settings').select('value').eq('key', 'is_provisioned').single();
    if (data?.value === 'true') {
      setView('main');
      fetchHistory();
    } else {
      setView('setup');
    }
  };

  const fetchHistory = async () => {
    const { data } = await supabase.from('chat_messages').select('*').order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // 2. TOTAL BYPASS LOGIN LOGIKA
  const handleBypass = () => {
    const adminUser = { id: '00000000-0000-0000-0000-000000000000', email: 'nermindurma81@gmail.com' };
    setUser(adminUser);
    checkIfProvisioned();
    toast.success("Admin Bypass Aktivan! 👑");
  };

  // 3. STVARNO KREIRANJE INSTANCE (Real Sync)
  const handleCreateInstance = async () => {
    setLoading(true);
    setView('provisioning');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_GATEWAY_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync', repo: repo, userId: user?.id })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("OS Instaliran!");
        setView('main');
      } else { throw new Error(data.error); }
    } catch (e: any) {
      toast.error("Build failed: " + e.message);
      setView('setup');
    } finally { setLoading(false); }
  };

  // 4. FILE UPLOAD (Supabase Storage)
  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    toast.loading("Učitavam fajl...");
    const { data, error } = await supabase.storage.from('files').upload(`${Date.now()}-${file.name}`, file);
    if (data) {
      const { data: { publicUrl } } = supabase.storage.from('files').getPublicUrl(data.path);
      setFileUrl(publicUrl);
      toast.dismiss();
      toast.success("Fajl spreman!");
    }
  };

  // 5. CHAT LOGIKA
  const handleSend = async () => {
    if (!input || loading) return;
    const msg = input; setInput(''); setLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: msg, file_url: fileUrl }]);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_GATEWAY_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, userId: user.id, conversationId: 'session-1', agentId: selectedAgent, fileUrl })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
      setFileUrl(null);
    } catch (e) { toast.error("Gateway Offline"); }
    setLoading(false);
  };

  // --- UI RENDERERI ---

  if (view === 'auth') return (
    <div className="h-screen bg-[#0b0e14] flex flex-col items-center justify-center p-6 space-y-6">
      <div className="w-24 h-24 bg-blue-600/10 rounded-[2.5rem] flex items-center justify-center border border-blue-600/20 animate-pulse">
        <Bot size={50} className="text-blue-500" />
      </div>
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tighter text-white">OPENCLAW OS</h1>
        <p className="text-gray-500 text-sm uppercase tracking-[0.3em]">Kralj Edition v2.5</p>
      </div>
      <button onClick={handleBypass} className="bg-white text-black px-12 py-5 rounded-2xl font-bold text-xl hover:scale-105 transition-all shadow-2xl active:scale-95">
        UĐI KAO GAZDA 👑
      </button>
      <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })} className="text-gray-500 text-xs hover:text-white underline transition-colors">
        ILI KORISTI GOOGLE LOGIN
      </button>
    </div>
  );

  if (view === 'setup') return (
    <div className="h-screen bg-[#0a0c10] flex items-center justify-center p-6">
      <div className="bg-[#12161f] border border-white/10 w-full max-w-xl p-10 rounded-[2.5rem] shadow-3xl space-y-8 animate-in zoom-in-95">
        <div className="flex justify-between items-center"><h2 className="text-3xl font-bold tracking-tighter">New Instance</h2><X className="text-gray-600 cursor-pointer"/></div>
        <div className="grid grid-cols-1 gap-4">
          <div className="p-6 rounded-3xl bg-blue-600/10 border-2 border-blue-600 flex items-center gap-4">
            <Bot className="text-red-500" size={40}/>
            <div><p className="font-bold text-white uppercase">OpenClaw Engine</p><p className="text-xs text-gray-500">v2.5.0 Production Ready</p></div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-1">
             <label className="text-[10px] font-bold text-gray-500 uppercase ml-2">Instance Name</label>
             <input value={instanceName} onChange={(e)=>setInstanceName(e.target.value)} className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl outline-none" />
          </div>
          <div className="space-y-1">
             <label className="text-[10px] font-bold text-gray-500 uppercase ml-2">GitHub Brain Repo</label>
             <input value={repo} onChange={(e)=>setRepo(e.target.value)} className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl outline-none text-blue-400 font-mono text-sm" />
          </div>
          <button onClick={handleCreateInstance} disabled={loading} className="w-full bg-white text-black py-5 rounded-2xl font-bold text-lg hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-50">
            {loading ? "PROVISIONING..." : "CREATE & SYNC INSTANCE"}
          </button>
        </div>
      </div>
    </div>
  );

  if (view === 'provisioning') return (
    <div className="h-screen bg-[#0a0c10] flex flex-col items-center justify-center space-y-8">
      <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tighter uppercase">Initializing OS...</h2>
        <p className="text-gray-500 text-sm">Dohvatam tvoj backup sa GitHuba i podešavam bazu podataka.</p>
      </div>
      <div className="w-full max-w-xs space-y-3 bg-black/20 p-6 rounded-2xl border border-white/5">
         <div className="flex items-center gap-3 text-xs text-green-500 font-bold"><CheckCircle2 size={14}/> Environment ready</div>
         <div className="flex items-center gap-3 text-xs text-blue-400 font-bold animate-pulse"><Activity size={14}/> Syncing skills from repo...</div>
         <div className="flex items-center gap-3 text-xs text-gray-600"><Clock size={14}/> Finalizing Gateway...</div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0b0e14] text-[#e2e8f0] font-sans overflow-hidden">
      <Toaster />
      
      {/* SIDEBAR (Gensee Crate Look) */}
      <aside className={`fixed md:relative z-50 w-72 h-full bg-[#0e121a] border-r border-white/5 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-8 flex items-center gap-3 border-b border-white/5">
          <Bot className="text-red-500" size={24}/><span className="font-bold tracking-widest uppercase text-sm">OpenClaw OS</span>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          <p className="text-[10px] font-bold text-gray-600 uppercase px-4 py-4 tracking-widest">Main OS Menu</p>
          {[
            { id: 'chat', icon: MessageSquare, label: 'Chat Session' },
            { id: 'channels', icon: Smartphone, label: 'Channels' },
            { id: 'models', icon: Cpu, label: 'Models Setup' },
            { id: 'skills', icon: Layers, label: 'Installed Skills' },
            { id: 'control', icon: Terminal, label: 'OS Control' },
            { id: 'debug', icon: Info, label: 'Debug Info' },
          ].map(i => (
            <button key={i.id} onClick={() => setActiveTab(i.id)} className={`w-full flex items-center gap-3 p-4 rounded-2xl text-xs font-bold transition-all ${activeTab === i.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-gray-500 hover:bg-white/5'}`}>
              <i.icon size={18}/> {i.label}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-white/5 flex items-center justify-between">
           <div className="text-[10px] font-bold text-gray-600 uppercase">Status: <span className="text-green-500">Live</span></div>
           <button onClick={() => window.location.reload()} className="text-gray-600 hover:text-white"><RefreshCw size={14}/></button>
        </div>
      </aside>

      {/* MAIN VIEW AREA */}
      <main className="flex-1 flex flex-col relative min-w-0 bg-[#0b0e14]">
        <header className="h-16 border-b border-white/5 flex items-center px-8 justify-between bg-[#0b0e14]/80 backdrop-blur-xl z-40">
           <Menu onClick={() => setIsSidebarOpen(true)} className="md:hidden text-gray-400 cursor-pointer hover:text-white"/>
           <div className="flex items-center gap-4">
              <select value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)} className="bg-[#161a23] text-[10px] font-bold text-blue-400 border border-white/10 px-4 py-2 rounded-full outline-none uppercase tracking-widest cursor-pointer hover:border-blue-500/50 transition-all">
                <option value="koder-pro">Koder Pro (Free)</option>
                <option value="ollama-local">Ollama Local</option>
                <option value="groq-llama">Groq Llama 3.3</option>
              </select>
              <div className="hidden sm:flex items-center gap-2">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"/>
                 <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Instance Ready</span>
              </div>
           </div>
           <button onClick={() => setMessages([])} className="text-[10px] font-bold text-gray-500 hover:text-white flex items-center gap-2"><Plus size={14}/> NEW CHAT</button>
        </header>

        {activeTab === 'chat' ? (
          <div className="flex-1 flex flex-col overflow-hidden relative">
            
            {/* WINDOW SIMULATION (Messages) */}
            <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 custom-scrollbar">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-20 text-center space-y-4">
                  <Bot size={80} className="text-white"/>
                  <h2 className="text-3xl font-bold tracking-tighter uppercase">Kralj OS Active</h2>
                  <p className="text-sm max-w-xs mx-auto">Sistem je sinkroniziran sa tvog repoa. Spreman sam za rad.</p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                  <div className={`max-w-[85%] md:max-w-[70%] p-6 rounded-[2.5rem] text-sm leading-relaxed shadow-2xl ${
                    m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none shadow-blue-900/20' : 'bg-[#161a23] border border-white/5 text-gray-100 rounded-bl-none shadow-black/50'
                  }`}>
                    {m.file_url && <div className="mb-3 p-3 bg-black/30 rounded-2xl text-[10px] text-blue-300 truncate flex items-center gap-2"><Paperclip size={12}/> {m.file_url.split('/').pop()}</div>}
                    <pre className="whitespace-pre-wrap font-sans">{m.content}</pre>
                  </div>
                </div>
              ))}
              {loading && <div className="text-blue-500 text-[10px] font-mono animate-pulse uppercase tracking-widest px-6 italic">Kralj procesira tvoj upit...</div>}
              <div ref={chatEndRef} />
            </div>

            {/* INPUT BAR (Gensee Style) */}
            <div className="p-6 md:p-10 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/90 to-transparent">
              <div className="max-w-4xl mx-auto relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2.5rem] blur opacity-10 transition group-focus-within:opacity-25 duration-1000"></div>
                <div className="relative flex items-center bg-[#161a23]/95 backdrop-blur-2xl border border-white/10 p-2 rounded-[2.5rem] shadow-3xl transition-all focus-within:border-white/20">
                  <label className="p-4 text-gray-500 hover:text-blue-400 cursor-pointer transition-colors">
                    <Paperclip size={22} />
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                  </label>
                  <input 
                    value={input} 
                    onChange={(e)=>setInput(e.target.value)} 
                    onKeyDown={(e)=>e.key==='Enter' && handleSend()} 
                    placeholder="Message Kralj OS..." 
                    className="flex-1 bg-transparent border-none p-4 text-sm text-white focus:outline-none placeholder-gray-600" 
                  />
                  <button onClick={handleSend} disabled={loading || !input} className="p-5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-full shadow-lg active:scale-90 transition-all flex items-center justify-center">
                    <Send size={22}/>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 p-6 md:p-20 overflow-y-auto animate-in fade-in duration-500">
             <div className="gensee-window max-w-4xl mx-auto w-full overflow-hidden">
                {/* Traffic Lights Bar */}
                <div className="h-10 bg-black/20 border-b border-white/5 flex items-center px-4 gap-2">
                   <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"/>
                   <div className="w-3 h-3 rounded-full bg-yellow-500"/>
                   <div className="w-3 h-3 rounded-full bg-green-500"/>
                   <div className="flex-1 text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">{activeTab} Manager</div>
                </div>
                
                <div className="p-10 space-y-8">
                   {activeTab === 'models' && (
                      <div className="space-y-6">
                        <div className="bg-[#1a1f2b] p-6 rounded-2xl border border-white/5 space-y-4">
                           <h3 className="font-bold text-sm">Ollama Local Connection</h3>
                           <p className="text-xs text-gray-500">Unesi Ngrok ili Cloudflare tunnel URL tvog kućnog računara.</p>
                           <input placeholder="https://your-tunnel.app" className="w-full bg-[#0f1219] p-4 rounded-2xl border border-white/10 text-xs outline-none focus:border-blue-500" />
                           <button onClick={()=>toast.success("Ollama URL saved!")} className="w-full bg-blue-600 p-3 rounded-xl font-bold text-xs shadow-lg">SPREMI KONFIGURACIJU</button>
                        </div>
                      </div>
                   )}
                   {activeTab === 'control' && (
                      <div className="grid grid-cols-2 gap-4">
                        <button onClick={()=>window.location.reload()} className="bg-[#1a1f2b] border border-white/5 p-8 rounded-3xl flex flex-col items-center gap-4 hover:bg-white/5 transition-all">
                           <RefreshCw className="text-orange-500" size={32}/>
                           <span className="font-bold text-xs uppercase tracking-widest">Reload OS</span>
                        </button>
                        <button onClick={handleProvision} className="bg-[#1a1f2b] border border-white/5 p-8 rounded-3xl flex flex-col items-center gap-4 hover:bg-white/5 transition-all">
                           <RefreshCw className="text-blue-500" size={32}/>
                           <span className="font-bold text-xs uppercase tracking-widest">Force Brain Sync</span>
                        </button>
                      </div>
                   )}
                   {activeTab === 'debug' && (
                      <div className="bg-black/40 p-8 rounded-3xl border border-white/5 space-y-4 font-mono text-xs">
                         <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-gray-500">Gateway Status</span><span className="text-green-500 font-bold uppercase tracking-widest">Stable</span></div>
                         <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-gray-500">Active Provider</span><span className="text-blue-400">Groq / Failover Enabled</span></div>
                         <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-gray-500">Instance Owner</span><span className="text-white">{user?.email}</span></div>
                         <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-gray-500">Installed Skills</span><span className="text-white">Agentic-Coding, Video-Master, YouTube-Sync</span></div>
                         <div className="flex justify-between"><span className="text-gray-500">CORS Logic</span><span className="text-white">Active (headers enabled)</span></div>
                      </div>
                   )}
                </div>
             </div>
          </div>
        )}
      </main>

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
