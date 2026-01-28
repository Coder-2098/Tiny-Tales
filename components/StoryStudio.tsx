
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { KidProfile, Story, StoryScene, AgeBand } from '../types';
import { StorageService } from '../services/storage';
import { GeminiService } from '../services/gemini';
import { SafetyService } from '../services/safety';
import { TEMPLATES, AVATARS } from '../constants';
import DrawingCanvas from './DrawingCanvas';

interface StoryStudioProps {
  kid: KidProfile;
  onExit: () => void;
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const MascotBackground: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-10">
    <span className="absolute top-[10%] left-[15%] text-6xl floating-slow" style={{ animationDelay: '0s' }}>✨</span>
    <span className="absolute top-[25%] right-[20%] text-7xl floating-slow" style={{ animationDelay: '2s' }}>🎨</span>
    <span className="absolute bottom-[20%] left-[10%] text-5xl floating-slow" style={{ animationDelay: '4s' }}>🍃</span>
    <span className="absolute top-[60%] right-[15%] text-6xl floating-slow" style={{ animationDelay: '1s' }}>🌈</span>
  </div>
);

const StoryStudio: React.FC<StoryStudioProps> = ({ kid, onExit }) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeechLoading, setIsSpeechLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showCanvas, setShowCanvas] = useState<{ active: boolean; sceneId?: string }>({ active: false });
  const [selectedVoice, setSelectedVoice] = useState('Puck');
  const [playbackSpeed, setPlaybackSpeed] = useState(1.1);
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    setStories(StorageService.getStoriesByKid(kid.id));
    
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    };
    
    window.addEventListener('mousedown', initAudio, { once: true });
    window.addEventListener('touchstart', initAudio, { once: true });
    
    return () => {
      stopSpeaking();
      window.removeEventListener('mousedown', initAudio);
      window.removeEventListener('touchstart', initAudio);
    };
  }, [kid.id]);

  const handleStartStory = async (templateId?: string) => {
    setApiError(null);
    let builderData = { character: '', setting: '', goal: '', mood: 'Happy' };
    if (templateId) {
      const template = TEMPLATES.find(t => t.id === templateId);
      if (template) {
        builderData = { character: template.character, setting: template.setting, goal: template.goal, mood: template.mood };
      }
    }

    const newStory: Story = {
      id: crypto.randomUUID(),
      title: templateId ? TEMPLATES.find(t => t.id === templateId)?.name || 'Adventure' : 'My Tale',
      kidProfileId: kid.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ageBand: kid.ageBand,
      scenes: [],
      ...builderData
    };

    setIsLoading(true);
    try {
      const firstSceneText = await GeminiService.generateStoryScene(newStory);
      const scene: StoryScene = { id: crypto.randomUUID(), text: firstSceneText, timestamp: Date.now() };
      newStory.scenes.push(scene);
      StorageService.saveStory(newStory);
      setActiveStory(newStory);
      setStories(StorageService.getStoriesByKid(kid.id));
      setSuggestions(await GeminiService.generateSuggestions(newStory));
    } catch (err: any) {
      const isRateLimit = err?.message?.includes("429") || err?.message?.includes("RESOURCE_EXHAUSTED");
      setApiError(isRateLimit ? "TinyTales is taking a nap. Try again in a minute! 😴" : "Magic wand broke! Try starting again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = async (prompt: string = userInput, visionData?: string) => {
    if (!activeStory) return;
    setApiError(null);
    setIsLoading(true);
    setUserInput('');
    try {
      let visionDescription = "";
      if (visionData) {
        const result = await GeminiService.interpretImage(visionData);
        visionDescription = result.description;
      }
      const nextText = await GeminiService.generateStoryScene(activeStory, prompt, visionDescription);
      const newScene: StoryScene = { id: crypto.randomUUID(), text: nextText, imageUrl: visionData, timestamp: Date.now() };
      const updatedStory = { ...activeStory, updatedAt: Date.now(), scenes: [...activeStory.scenes, newScene] };
      StorageService.saveStory(updatedStory);
      setActiveStory(updatedStory);
      setStories(StorageService.getStoriesByKid(kid.id));
      setSuggestions(await GeminiService.generateSuggestions(updatedStory));
    } catch (err: any) {
      const isRateLimit = err?.message?.includes("429") || err?.message?.includes("RESOURCE_EXHAUSTED");
      setApiError(isRateLimit ? "Too much magic at once! Let's wait a moment. ⏳" : "Oops, the story got stuck. Try again!");
    } finally {
      setIsLoading(false);
    }
  };

  const updateSceneText = (sceneId: string, newText: string) => {
    if (!activeStory) return;
    const updatedScenes = activeStory.scenes.map(s => s.id === sceneId ? { ...s, text: newText } : s);
    const updatedStory = { ...activeStory, scenes: updatedScenes, updatedAt: Date.now() };
    setActiveStory(updatedStory);
    StorageService.saveStory(updatedStory);
  };

  const updateStoryTitle = (newTitle: string) => {
    if (!activeStory) return;
    const updatedStory = { ...activeStory, title: newTitle, updatedAt: Date.now() };
    setActiveStory(updatedStory);
    StorageService.saveStory(updatedStory);
    setStories(StorageService.getStoriesByKid(kid.id));
  };

  const deleteStory = (storyId: string) => {
    if (confirm("Delete this story forever? 🗑️")) {
      StorageService.deleteStory(storyId);
      if (activeStory?.id === storyId) setActiveStory(null);
      setStories(StorageService.getStoriesByKid(kid.id));
    }
  };

  const updateSceneImage = (sceneId: string, imageData: string) => {
    if (!activeStory) return;
    const updatedScenes = activeStory.scenes.map(s => s.id === sceneId ? { ...s, imageUrl: imageData } : s);
    const updatedStory = { ...activeStory, scenes: updatedScenes, updatedAt: Date.now() };
    setActiveStory(updatedStory);
    StorageService.saveStory(updatedStory);
    setShowCanvas({ active: false });
  };

  const speakText = async (text: string) => {
    if (!activeStory) return;
    setApiError(null);
    stopSpeaking();
    setIsSpeechLoading(true);
    try {
      const base64Audio = await GeminiService.generateSpeech(text, selectedVoice);
      if (!base64Audio) throw new Error("No audio returned");
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const audioBuffer = await decodeAudioData(decode(base64Audio), audioContextRef.current, 24000, 1);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.playbackRate.value = playbackSpeed;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsSpeaking(false);
      
      audioSourceRef.current = source;
      source.start(0);
      setIsSpeaking(true);
    } catch (err: any) {
      setApiError("Can't speak right now. Check your connection!");
    } finally {
      setIsSpeechLoading(false);
    }
  };

  const stopSpeaking = () => {
    if (audioSourceRef.current) {
      try { audioSourceRef.current.stop(); } catch (e) {}
      audioSourceRef.current = null;
    }
    setIsSpeaking(false);
    setIsSpeechLoading(false);
  };

  const getAvatarUrl = () => {
    if (kid.avatarId && kid.avatarId.startsWith('data:')) return kid.avatarId;
    return AVATARS.find(a => a.id === kid.avatarId)?.url || AVATARS[0].url;
  };

  return (
    <div className="flex flex-col md:flex-row h-full flex-1 overflow-hidden bg-black/20">
      {/* Sidebar - Themed */}
      <aside className="w-full md:w-80 bg-[#06181f]/90 text-white flex flex-col p-6 shadow-2xl border-r border-teal-900/50 z-20 backdrop-blur-md">
        <div className="flex items-center gap-4 mb-10 p-4 bg-teal-950/50 rounded-3xl border border-teal-800">
          <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-orange-400 bg-white shadow-inner flex items-center justify-center">
            <img src={getAvatarUrl()} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <p className="font-kids text-3xl truncate">{kid.nickname}</p>
        </div>
        
        <button onClick={() => { setActiveStory(null); setApiError(null); }} className="w-full py-5 mb-8 bg-orange-500 text-white rounded-3xl font-bold text-2xl shadow-xl hover:bg-orange-600 transition-all border-b-4 border-orange-800 active:border-b-0 font-kids">
          ✨ New Story
        </button>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
          <h4 className="text-xs font-bold text-teal-500 uppercase tracking-widest px-2 mb-2">My Tales Collection</h4>
          {stories.map(s => (
            <div key={s.id} className="relative group flex items-center gap-2">
              <button 
                onClick={() => { setActiveStory(s); setApiError(null); }} 
                className={`flex-1 p-4 pr-12 text-left rounded-2xl transition-all border ${activeStory?.id === s.id ? 'bg-orange-400/20 border-orange-400/50 shadow-lg' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
              >
                <p className="font-bold text-white text-sm truncate">{s.title}</p>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); deleteStory(s.id); }}
                className="absolute right-3 p-2 bg-black/40 text-gray-400 hover:text-rose-400 rounded-full transition-all z-10"
                title="Delete Story"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        <button onClick={onExit} className="mt-6 p-4 text-orange-300 font-bold hover:text-white transition-all text-center rounded-2xl border border-orange-900/50">
          ← Switch Hero
        </button>
      </aside>

      {/* Main Studio Area */}
      <section className="flex-1 flex flex-col h-full overflow-y-auto relative">
        <MascotBackground />
        
        {apiError && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-rose-600 text-white px-8 py-4 rounded-full shadow-2xl font-bold animate-in slide-in-from-top-4 flex items-center gap-3">
            <span>⚠️</span> {apiError}
            <button onClick={() => setApiError(null)} className="ml-4 opacity-70 hover:opacity-100">✕</button>
          </div>
        )}

        {!activeStory ? (
          <div className="p-10 max-w-4xl mx-auto w-full space-y-12 pb-20 relative z-10">
            <h2 className="text-8xl font-kids text-white text-center jungle-text-shadow">Let's Imagine!</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {TEMPLATES.map(t => (
                <button key={t.id} onClick={() => handleStartStory(t.id)} className={`group p-8 rounded-[4rem] border-4 transition-all hover:scale-105 shadow-xl text-left flex flex-col gap-4 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20`}>
                  <span className="text-7xl group-hover:scale-110 transition-transform">{t.icon}</span>
                  <h3 className="text-4xl font-kids text-white">{t.name}</h3>
                  <p className="text-lg text-teal-100 opacity-80">{t.description}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-6 pb-64 relative z-10">
            <header className="mb-10 flex flex-col gap-6 glass-card p-8 rounded-[3rem] shadow-2xl sticky top-4 z-30">
              <div className="flex justify-between items-center w-full">
                {editingTitle ? (
                  <div className="flex items-center gap-4 flex-1">
                    <input 
                      autoFocus
                      className="bg-white text-teal-900 text-4xl font-kids p-2 rounded-xl border-4 border-orange-400 outline-none w-full shadow-inner text-black"
                      value={activeStory.title}
                      onChange={(e) => updateStoryTitle(e.target.value)}
                      onBlur={() => setEditingTitle(false)}
                      onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(false)}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setEditingTitle(true)}>
                    <h2 className="text-5xl font-kids text-teal-950 truncate group-hover:text-orange-500 transition-colors">
                      {activeStory.title}
                    </h2>
                    <span className="text-2xl opacity-50">✏️</span>
                  </div>
                )}
                
                <div className="flex gap-4">
                  {isSpeechLoading ? (
                    <div className="bg-teal-600 text-white px-8 py-4 rounded-full font-bold animate-pulse flex items-center gap-2 shadow-lg font-kids text-xl">
                      <span className="animate-spin">🪄</span> Wait...
                    </div>
                  ) : isSpeaking ? (
                    <button onClick={stopSpeaking} className="bg-rose-600 text-white px-8 py-4 rounded-full font-bold shadow-xl active:scale-95 transition-all text-xl font-kids">⏹ Stop</button>
                  ) : (
                    <button onClick={() => speakText(activeStory.scenes[activeStory.scenes.length - 1].text)} className="bg-teal-600 text-white px-8 py-4 rounded-full font-bold shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center gap-2 border-b-4 border-teal-800 text-xl font-kids">
                      🔊 Listen
                    </button>
                  )}
                </div>
              </div>
            </header>

            <div className="space-y-12">
              {activeStory.scenes.map((scene) => (
                <div key={scene.id} className="glass-card p-10 rounded-[4rem] shadow-2xl relative group hover:border-orange-400 transition-all">
                  {editingSceneId === scene.id ? (
                    <div className="space-y-4">
                      <textarea 
                        autoFocus
                        className="w-full min-h-[200px] p-8 bg-white rounded-[3rem] border-4 border-teal-500 text-black text-3xl leading-relaxed outline-none shadow-inner font-storybook"
                        value={scene.text}
                        onChange={(e) => updateSceneText(scene.id, e.target.value)}
                      />
                      <div className="flex gap-4">
                        <button onClick={() => setEditingSceneId(null)} className="px-10 py-3 bg-teal-600 text-white rounded-full font-bold text-xl shadow-lg font-kids">Save ✅</button>
                        <button onClick={() => setEditingSceneId(null)} className="px-10 py-3 bg-gray-200 text-gray-600 rounded-full font-bold text-xl font-kids">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div className="relative">
                        <p className="text-4xl text-teal-950 leading-relaxed font-storybook pr-16" onClick={() => setEditingSceneId(scene.id)}>
                          {scene.text}
                        </p>
                        <button 
                          onClick={() => setEditingSceneId(scene.id)} 
                          className="absolute top-0 right-0 p-4 bg-teal-100 rounded-full border border-teal-200 shadow-lg hover:scale-110 transition-transform group-hover:bg-teal-200"
                        >
                          <span className="text-2xl">✏️</span>
                        </button>
                      </div>
                      
                      {scene.imageUrl ? (
                        <div className="relative group rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl bg-white aspect-video flex items-center justify-center">
                          <img src={scene.imageUrl} alt="Drawing" className="w-full h-full object-contain" />
                          <button onClick={() => setShowCanvas({ active: true, sceneId: scene.id })} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-4xl font-kids transition-opacity">Redraw! 🎨</button>
                        </div>
                      ) : (
                        <button onClick={() => setShowCanvas({ active: true, sceneId: scene.id })} className="text-2xl font-kids text-teal-600 border-4 border-teal-100 px-10 py-4 rounded-3xl hover:bg-teal-50 transition-all active:scale-95">Draw an illustration! 🎨</button>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="text-teal-200 text-5xl font-kids text-center py-10 animate-pulse jungle-text-shadow">
                  Magic is happening... ✨
                </div>
              )}
            </div>

            {/* Bottom Bar - Styled like a book flap */}
            <div className="fixed bottom-0 left-0 md:left-80 right-0 p-10 bg-gradient-to-t from-black/50 to-transparent z-40 pointer-events-none">
              <div className="max-w-4xl mx-auto w-full flex items-center gap-6 glass-card p-6 rounded-[4rem] shadow-2xl border-4 border-orange-400 pointer-events-auto">
                <button onClick={() => setShowCanvas({ active: true })} className="p-6 bg-orange-500 text-white rounded-3xl text-4xl active:scale-90 hover:bg-orange-600 transition-all shadow-lg border-b-4 border-orange-800">🎨</button>
                <input 
                  className="flex-1 p-6 bg-transparent outline-none text-teal-950 font-storybook text-3xl placeholder:text-gray-400" 
                  placeholder="What happens next?" 
                  value={userInput} 
                  onChange={e => setUserInput(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && handleContinue()} 
                />
                <button 
                  onClick={() => handleContinue()} 
                  disabled={isLoading || !userInput.trim()} 
                  className={`p-8 bg-teal-600 text-white rounded-3xl shadow-xl text-3xl active:scale-95 transition-all border-b-8 border-teal-900 ${(!userInput.trim() || isLoading) ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:bg-teal-500'}`}
                >
                  🚀
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {showCanvas.active && (
        <DrawingCanvas 
          onSave={(data) => {
            if (showCanvas.sceneId) updateSceneImage(showCanvas.sceneId, data);
            else { setShowCanvas({ active: false }); handleContinue("Look at this...", data); }
          }} 
          onClose={() => setShowCanvas({ active: false })} 
        />
      )}
    </div>
  );
};

export default StoryStudio;
