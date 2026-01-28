
import React, { useState, useEffect, useRef } from 'react';
import { StorageService } from './services/storage';
import { GeminiService } from './services/gemini';
import { KidProfile, AgeBand } from './types';
import Layout from './components/Layout';
import ParentDashboard from './components/ParentDashboard';
import StoryStudio from './components/StoryStudio';
import DrawingCanvas from './components/DrawingCanvas';
import { AVATARS, AGE_BANDS } from './constants';
import { APP_CONFIG } from './config/app.config';

enum View {
  LANDING = 'landing',
  PARENT_LOGIN = 'parent_login',
  PARENT_DASHBOARD = 'parent_dashboard',
  KID_SELECT = 'kid_select',
  KID_CREATE = 'kid_create',
  STUDIO = 'studio'
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.LANDING);
  const [kids, setKids] = useState<KidProfile[]>([]);
  const [selectedKid, setSelectedKid] = useState<KidProfile | null>(null);
  const [passcode, setPasscode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profileEditor, setProfileEditor] = useState<KidProfile>({
    id: '', nickname: '', avatarId: AVATARS[0].id, ageBand: AgeBand.EARLY
  });

  useEffect(() => {
    setKids(StorageService.getKids());
  }, []);

  const handleParentLogin = () => {
    if (passcode === APP_CONFIG.STORAGE_KEYS.PARENT_PASSCODE) { 
      setCurrentView(View.PARENT_DASHBOARD);
      setPasscode('');
    } else alert("Secret code wrong!");
  };

  const saveProfile = () => {
    if (!profileEditor.nickname.trim()) return alert("Enter a Hero Name!");
    const kid = { ...profileEditor, id: profileEditor.id || crypto.randomUUID() };
    StorageService.saveKid(kid);
    setKids(StorageService.getKids());
    setCurrentView(View.KID_SELECT);
  };

  const getAvatarUrl = (id: string) => {
    if (id?.startsWith('data:image')) return id;
    return AVATARS.find(a => a.id === id)?.url || AVATARS[0].url;
  };

  const handleMagicIcon = async (base64: string) => {
    setIsGenerating(true);
    setShowCanvas(false);
    try {
      const magicIcon = await GeminiService.generateHeroIcon(base64);
      setProfileEditor({ ...profileEditor, avatarId: magicIcon || base64 });
    } catch (err) {
      setProfileEditor({ ...profileEditor, avatarId: base64 });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Layout>
      {currentView !== View.LANDING && currentView !== View.STUDIO && (
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50">
          <button onClick={() => setCurrentView(View.LANDING)} className="px-6 py-2 bg-white/90 backdrop-blur rounded-full font-bold text-teal-900 shadow-lg hover:bg-white transition-colors">← Home</button>
          <button onClick={() => setCurrentView(View.PARENT_LOGIN)} className="px-6 py-2 bg-orange-400 rounded-full font-bold text-white shadow-lg border-2 border-orange-500 hover:bg-orange-500 transition-colors">Parent Station 🔐</button>
        </div>
      )}

      {currentView === View.LANDING && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-12">
          <div className="space-y-4">
            <div className="inline-block px-8 py-2 bg-black/30 backdrop-blur-sm rounded-full mb-4">
              <span className="text-teal-200 font-bold tracking-[0.3em] uppercase text-sm">— The Magic Studio —</span>
            </div>
            <h1 className="text-8xl md:text-9xl font-kids text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] leading-tight">
              {APP_CONFIG.APP_NAME.split(' ')[0]}<br/>
              <span className="text-orange-400">{APP_CONFIG.APP_NAME.split(' ')[1]}</span>
            </h1>
            <p className="text-3xl text-teal-100 font-storybook italic opacity-90">Open your imagination book...</p>
          </div>
          <button onClick={() => setCurrentView(View.KID_SELECT)} className="group relative py-10 px-24 bg-orange-500 text-white rounded-[3rem] text-6xl font-kids shadow-[0_20px_0_rgb(194,120,0)] hover:shadow-[0_15px_0_rgb(194,120,0)] hover:translate-y-1 active:shadow-none active:translate-y-5 transition-all">
            Open Book! 📖
          </button>
        </div>
      )}

      {currentView === View.KID_SELECT && (
        <div className="flex-1 flex flex-col items-center justify-center p-10 pt-24 space-y-12">
          <h2 className="text-7xl font-kids text-white jungle-text-shadow">Who's Reading?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-6xl">
            {kids.map(kid => (
              <button key={kid.id} onClick={() => { setSelectedKid(kid); setCurrentView(View.STUDIO); }} className="flex flex-col items-center gap-4 group p-8 glass-card rounded-[3rem] shadow-2xl hover:scale-105 transition-all">
                <div className="w-40 h-40 rounded-full overflow-hidden border-8 border-teal-100 shadow-inner bg-teal-50">
                  <img src={getAvatarUrl(kid.avatarId)} alt={kid.nickname} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-4xl font-kids text-teal-900">{kid.nickname}</h3>
              </button>
            ))}
            <button onClick={() => setCurrentView(View.KID_CREATE)} className="flex flex-col items-center justify-center gap-4 bg-white/10 backdrop-blur-md p-8 rounded-[3rem] border-4 border-dashed border-white/30 hover:bg-white/20 transition-all">
              <div className="w-40 h-40 rounded-full bg-white/20 flex items-center justify-center text-8xl text-white font-bold">+</div>
              <h3 className="text-3xl font-kids text-white">New Hero</h3>
            </button>
          </div>
        </div>
      )}

      {currentView === View.KID_CREATE && (
        <div className="flex-1 flex flex-col items-center justify-center p-10 pt-24">
          <div className="glass-card rounded-[4rem] p-12 max-w-4xl w-full shadow-2xl space-y-10">
            <h2 className="text-6xl font-kids text-teal-900 text-center">New Explorer 🪄</h2>
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              <div className="flex flex-col items-center gap-6 w-full lg:w-1/3">
                <div className="relative w-64 h-64 rounded-full border-8 border-teal-100 overflow-hidden shadow-2xl bg-teal-50 flex items-center justify-center">
                  {isGenerating ? <div className="animate-pulse text-teal-600 font-bold font-kids text-2xl">Magic...</div> : <img src={getAvatarUrl(profileEditor.avatarId)} className="w-full h-full object-cover" />}
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setShowCanvas(true)} className="px-6 py-2 bg-teal-600 text-white rounded-full font-bold text-sm hover:bg-teal-700">🎨 Draw</button>
                  <button onClick={() => fileInputRef.current?.click()} className="px-6 py-2 bg-teal-100 text-teal-700 rounded-full font-bold text-sm hover:bg-teal-200">📸 Photo</button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const r = new FileReader();
                      r.onload = () => handleMagicIcon(r.result as string);
                      r.readAsDataURL(file);
                    }
                  }} />
                </div>
              </div>
              <div className="flex-1 w-full space-y-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-teal-700 uppercase tracking-widest px-2">Explorer Name</label>
                  <input 
                    className="w-full p-6 bg-white rounded-3xl text-3xl font-kids outline-none border-4 border-teal-100 focus:border-orange-400 text-black placeholder:text-gray-300 shadow-inner" 
                    placeholder="Enter name..." 
                    value={profileEditor.nickname} 
                    onChange={e => setProfileEditor({...profileEditor, nickname: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-teal-700 uppercase tracking-widest px-2">Choose Avatar</label>
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-4 p-4 bg-teal-50 rounded-3xl border-2 border-teal-100">
                    {AVATARS.map(a => (
                      <button key={a.id} onClick={() => setProfileEditor({...profileEditor, avatarId: a.id})} className={`p-1 rounded-full border-4 transition-all ${profileEditor.avatarId === a.id ? 'border-orange-500 scale-110 bg-white shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}><img src={a.url} alt={a.name} className="w-full rounded-full" /></button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-6">
              <button onClick={() => setCurrentView(View.KID_SELECT)} className="flex-1 py-4 text-2xl font-kids text-gray-400 hover:text-gray-600">Cancel</button>
              <button onClick={saveProfile} className="flex-[2] py-8 bg-orange-500 text-white rounded-[2.5rem] font-bold text-4xl font-kids shadow-xl border-b-8 border-orange-700 active:border-b-0 active:translate-y-2 transition-all">Start Adventure! 🚀</button>
            </div>
          </div>
        </div>
      )}

      {currentView === View.PARENT_LOGIN && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-black/40 backdrop-blur-md">
          <div className="bg-white p-16 rounded-[4rem] shadow-2xl w-full max-w-md text-center space-y-10 border-4 border-orange-200">
            <div className="flex flex-col items-center">
               <span className="text-6xl mb-4">🔐</span>
               <h2 className="text-4xl font-kids text-teal-900">Secret Gate</h2>
               <p className="text-gray-500">Only for big explorers!</p>
            </div>
            <input 
              type="password" 
              maxLength={4} 
              placeholder="••••" 
              className="w-full p-6 text-center text-7xl font-bold bg-teal-50 rounded-3xl outline-none border-4 border-transparent focus:border-teal-300 text-teal-900 tracking-widest" 
              value={passcode} 
              onChange={e => setPasscode(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleParentLogin()}
            />
            <button onClick={handleParentLogin} className="w-full py-6 bg-teal-600 text-white rounded-3xl font-bold text-3xl shadow-xl hover:bg-teal-700 transition-colors">Enter Station</button>
          </div>
        </div>
      )}

      {currentView === View.STUDIO && selectedKid && <StoryStudio kid={selectedKid} onExit={() => { setSelectedKid(null); setCurrentView(View.KID_SELECT); }} />}
      {currentView === View.PARENT_DASHBOARD && <ParentDashboard onExit={() => setCurrentView(View.KID_SELECT)} />}
      {showCanvas && <DrawingCanvas onSave={handleMagicIcon} onClose={() => setShowCanvas(false)} />}
    </Layout>
  );
};

export default App;
