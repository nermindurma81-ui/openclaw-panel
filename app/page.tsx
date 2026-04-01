'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Bot, Send, RefreshCw, Key, ShieldCheck, MessageSquare, Plus, Zap, Menu, X, Mic, Paperclip, Globe, Cpu, Layers } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function OpenClawUltimate() {
  const [user] = useState<any>({ id: '00000000-0000-0000-0000-000000000000', email: 'nermindurma81@gmail.com' });
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [convId] = useState('admin-session');
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [ollamaUrl, setOllamaUrl] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('koder-pro');
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const chatEndRef = useRef<null | HTMLDivElement>(null);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // FILE UPLOAD LOGIKA
  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    toast.loading("Slanje fajla...");
    const { data, error } = await supabase.storage.from('files').upload(`${Date.now()}-${file.name}`, file);
    if (data) {
      const { data: publicUrl } = supabase.storage.from('files').getPublicUrl(data.path);
      setFileUrl(publicUrl.publicUrl);
      toast.dismiss();
      toast.success("Fajl zakačen!");
    }
  };

  const handleSend = async () => {
    if (!input || loading) return;
    const msg = input; setInput(''); setLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: msg, file_url: fileUrl }]);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_GATEWAY_URL}/api/chat`, {
        method: 'POST',
        body: JSON.stringify({ message: msg, userId: user.id, conversationId: convId, agentId: selectedAgent, fileUrl })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
      setFileUrl(null);
    } catch (e) { toast.error("Gateway Offline"); }
    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-[#0b0e14] text-[#e2e8f0] font-sans overflow-hidden">
      <Toaster />
      
      {/* MOBILE SIDEBAR */}
      <aside className={`fixed md:relative z-50 w-72 h-full bg-[#11141b]/95 backdrop-blur-2xl border-r border-white/5 flex flex-col p-6 transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3 font-bold text-xl tracking-tighter text-white">
            <Bot className="text-blue-500" size={24}/> <span>OPENCLAW</span>
          </div>
          <X onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500"/>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto">
          <button onClick={() => {setActiveTab('chat'); setIsSidebarOpen(false);}} className={`w-full text-left p-4 rounded-2xl flex items-center gap-3 ${activeTab === 'chat' ? 'bg-blue-600 text-white' : 'hover:bg-white/5'}`}><MessageSquare size={18}/> Chat</button>
          <button onClick={() => {setActiveTab('sync'); setIsSidebarOpen(false);}} className={`w-full text-left p-4 rounded-2xl flex items-center gap-3 ${activeTab === 'sync' ? 'bg-white/10' : 'hover:bg-white/5'}`}><RefreshCw size={18}/> Brain Sync</button>
          <button onClick={() => {setActiveTab('resources'); setIsSidebarOpen(false);}} className={`w-full text-left p-4 rounded-2xl flex items-center gap-3 ${activeTab === 'resources' ? 'bg-white/10' : 'hover:bg-white/5'}`}><Globe size={18}/> Claw Resources</button>
          <button onClick={() => {setActiveTab('tokens'); setIsSidebarOpen(false);}} className={`w-full text-left p-4 rounded-2xl flex items-center gap-3 ${activeTab === 'tokens' ? 'bg-white/10' : 'hover:bg-white/5'}`}><Key size={18}/> API Tokens</button>
        </nav>
        <div className="p-4 bg-black/20 rounded-2xl text-[10px] font-bold text-blue-500 text-center uppercase">Admin Mode Active</div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col relative bg-[#0b0e14]">
        <header className="h-16 border-b border-white/5 flex items-center px-6 justify-between bg-[#0b0e14]/80 backdrop-blur-xl z-40">
          <Menu onClick={() => setIsSidebarOpen(true)} className="md:hidden text-gray-400"/>
          <select value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)} className="bg-[#161a23] text-[10px] font-bold text-blue-400 border border-white/10 px-4 py-2 rounded-full outline-none uppercase cursor-pointer">
            <option value="koder-pro">Koder Pro (Free)</option>
            <option value="ollama-local">Ollama Local</option>
            <option value="groq-llama">Groq Llama 3.3</option>
          </select>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
        </header>

        {activeTab === 'chat' ? (
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <div className="flex-1 overflow-y-auto p-4 md:p-12 space-y-8 scroll-smooth custom-scrollbar">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-message`}>
                  <div className={`max-w-[85%] md:max-w-[70%] p-5 rounded-[2rem] text-sm leading-relaxed shadow-2xl ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-[#161a23] border border-white/5 text-gray-100'}`}>
                    {m.file_url && <div className="mb-2 p-2 bg-black/20 rounded-xl text-[10px] text-blue-200 truncate">📎 {m.file_url.split('/').pop()}</div>}
                    <pre className="whitespace-pre-wrap font-sans">{m.content}</pre>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* MOBILE FLOATING INPUT */}
            <div className="p-4 md:p-10 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/90 to-transparent">
              <div className="max-w-4xl mx-auto relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2.5rem] blur opacity-10 group-focus-within:opacity-30 transition duration-1000"></div>
                <div className="relative flex items-center bg-[#161a23]/95 backdrop-blur-xl border border-white/10 p-2 rounded-[2.5rem] shadow-3xl">
                  <label className="p-4 text-gray-500 hover:text-blue-400 cursor-pointer"><Paperclip size={20}/><input type="file" className="hidden" onChange={handleFileUpload}/></label>
                  <input value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>e.key==='Enter' && handleSend()} placeholder="Gazda, reci šta treba..." className="flex-1 bg-transparent border-none p-4 text-sm text-white focus:outline-none" />
                  <button onClick={handleSend} className="p-5 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg active:scale-90 transition-all"><Send size={22}/></button>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'sync' ? (
          <div className="p-10 text-center max-w-2xl mx-auto space-y-10">
             <div className="bg-[#161a23] p-12 rounded-[3rem] border border-white/5 shadow-3xl">
                <RefreshCw size={60} className="mx-auto text-blue-500 mb-6"/>
                <h2 className="text-2xl font-bold uppercase mb-8">Brain & Skill Sync</h2>
                <button onClick={async () => { toast.loading("Sync..."); await fetch(`${process.env.NEXT_PUBLIC_GATEWAY_URL}/api/system/sync`, {method:'POST', body: JSON.stringify({userId: user.id, repo: "nermindurma81-ui/Kralj-backup"})}); toast.dismiss(); toast.success("Mozak učitan!"); }} className="bg-blue-600 px-12 py-5 rounded-3xl font-bold text-lg shadow-2xl">SYNC FROM GITHUB</button>
             </div>
          </div>
        ) : activeTab === 'resources' ? (
          <div className="p-10 max-w-2xl mx-auto w-full space-y-8">
            <h2 className="text-3xl font-bold">External Clawbots</h2>
            <div className="bg-[#161a23] p-8 rounded-[2.5rem] border border-white/5 space-y-6">
              <input placeholder="GitHub Repo URL (npr. kilo-ai/kiloclaw)" className="w-full bg-[#0d0f14] p-4 rounded-2xl border border-white/5 outline-none focus:border-blue-500" />
              <button className="w-full bg-blue-600 p-4 rounded-2xl font-bold">Dodaj Novi Resurs</button>
            </div>
          </div>
        ) : activeTab === 'tokens' ? (
          <div className="p-10 max-w-2xl mx-auto w-full space-y-8">
            <h2 className="text-3xl font-bold">AI Connections</h2>
            <div className="bg-[#161a23] p-8 rounded-[2.5rem] border border-white/5 space-y-6">
               <label className="text-xs text-gray-500 uppercase">Ollama URL (Lokalni Tunel)</label>
               <input value={ollamaUrl} onChange={(e)=>setOllamaUrl(e.target.value)} placeholder="http://1234.ngrok.app" className="w-full bg-[#0d0f14] p-4 rounded-2xl border border-white/5 outline-none" />
               <button onClick={async () => { await supabase.from('system_settings').upsert({key:'ollama_url', value: ollamaUrl}); toast.success("Ollama spremna!"); }} className="w-full bg-orange-600 p-4 rounded-2xl font-bold">Sačuvaj Ollama URL</button>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
