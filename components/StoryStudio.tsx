
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { KidProfile, Story, StoryScene, AgeBand } from '../types';
import { StorageService } from '../services/storage';
import { GeminiService } from '../services/gemini';
import { TEMPLATES, AVATARS, STORY_STARTERS } from '../constants';
import DrawingCanvas from './DrawingCanvas';

interface StoryStudioProps {
  kid: KidProfile;
  onExit: () => void;
}

// Decode base64 to Uint8Array for raw PCM processing
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Manually decode raw PCM data into an AudioBuffer as standard decodeAudioData expects file headers
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
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newMode, setNewMode] = useState<'selection' | 'writing' | 'templates'>('selection');
  const [showCanvas, setShowCanvas] = useState<{ active: boolean; sceneId?: string; isNewStory?: boolean }>({ active: false });
  const [selectedVoice, setSelectedVoice] = useState('Puck');
  const [playbackSpeed, setPlaybackSpeed] = useState(1.1);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  
  // Video Generation States
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [videoProgressMsg, setVideoProgressMsg] = useState("");
  const [showVideoModal, setShowVideoModal] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Helper to resolve the avatar image URL
  const getAvatarUrl = () => {
    const avatarId = kid.avatarId;
    if (!avatarId) return AVATARS[0].url;
    if (avatarId.startsWith('data:')) return avatarId;
    const prebuilt = AVATARS.find(a => a.id === avatarId);
    return prebuilt ? prebuilt.url : AVATARS[0].url;
  };

  const loadStoriesList = useCallback(() => {
    const kidStories = StorageService.getStoriesByKid(kid.id);
    const sorted = kidStories.sort((a, b) => b.updatedAt - a.updatedAt);
    setStories([...sorted]);
  }, [kid.id]);

  useEffect(() => {
    loadStoriesList();
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
  }, [kid.id, loadStoriesList]);

  const handleStartStory = async (params: { templateId?: string; customPrompt?: string; drawing?: string }) => {
    if (isLoading) return;
    setApiError(null);
    setIsLoading(true);

    const generateId = () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);

    let builderData = { 
      character: 'A brave explorer', 
      setting: 'A land of magic', 
      goal: 'Find a great mystery', 
      mood: 'Exciting' 
    };
    
    let storyTitle = 'My New Tale';
    let firstSceneText = params.customPrompt || "Once upon a time...";

    if (params.templateId) {
      const template = TEMPLATES.find(t => t.id === params.templateId);
      if (template) {
        builderData = { character: template.character, setting: template.setting, goal: template.goal, mood: template.mood };
        storyTitle = template.name;
        firstSceneText = template.startingText;
      }
    }

    const newStory: Story = {
      id: generateId(),
      title: params.customPrompt ? 'Idea: ' + params.customPrompt.substring(0, 15) + '...' : storyTitle,
      kidProfileId: kid.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ageBand: kid.ageBand,
      scenes: [],
      ...builderData
    };

    try {
      if (params.drawing) {
        const interpretation = await GeminiService.interpretImage(params.drawing);
        // Use AI to bridge the drawing with the start of the adventure
        firstSceneText = await GeminiService.generateStoryScene(newStory, "Start a story about this drawing", interpretation.description);
      }

      const scene: StoryScene = { id: generateId(), text: firstSceneText, imageUrl: params.drawing, timestamp: Date.now() };
      newStory.scenes.push(scene);
      StorageService.saveStory(newStory);
      setActiveStory({ ...newStory });
      setIsCreatingNew(false);
      setUserInput('');
      loadStoriesList();
    } catch (err: any) {
      setApiError("Oh no! The magic wand sparked. Let's try starting that adventure again!");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteStory = (e: React.MouseEvent | React.UIEvent, storyId: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (window.confirm("Delete this adventure forever? 🗑️")) {
      StorageService.deleteStory(storyId);
      if (activeStory?.id === storyId) {
        setActiveStory(null);
        setIsCreatingNew(false);
      }
      loadStoriesList();
    }
  };

  const handleContinue = async (prompt: string = userInput, visionData?: string) => {
    if (!activeStory || isLoading) return;
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
      const newScene: StoryScene = { 
        id: typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9), 
        text: nextText, 
        imageUrl: visionData, 
        timestamp: Date.now() 
      };
      const updatedStory = { ...activeStory, updatedAt: Date.now(), scenes: [...activeStory.scenes, newScene] };
      StorageService.saveStory(updatedStory);
      setActiveStory(updatedStory);
      loadStoriesList();
    } catch (err: any) {
      setApiError("Something went wrong. Let's try once more!");
    } finally {
      setIsLoading(false);
    }
  };

  const updateStoryTitle = (newTitle: string) => {
    if (!activeStory) return;
    const updatedStory = { ...activeStory, title: newTitle, updatedAt: Date.now() };
    setActiveStory(updatedStory);
    StorageService.saveStory(updatedStory);
    loadStoriesList();
  };

  const handleUpdateSceneText = (sceneId: string, newText: string) => {
    if (!activeStory) return;
    const updatedScenes = activeStory.scenes.map(s => s.id === sceneId ? { ...s, text: newText } : s);
    const updatedStory = { ...activeStory, scenes: updatedScenes, updatedAt: Date.now() };
    setActiveStory(updatedStory);
    StorageService.saveStory(updatedStory);
  };

  const speakText = async (text: string) => {
    if (!activeStory || isSpeechLoading) return;
    stopSpeaking();
    setIsSpeechLoading(true);
    try {
      const base64Audio = await GeminiService.generateSpeech(text, selectedVoice);
      if (!base64Audio) throw new Error();
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
    } catch (err) {
      setApiError("The magic voice is resting. Try again soon!");
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

  const handleGenerateMovie = async () => {
    if (!activeStory) return;
    
    // Check key selection for Veo
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      alert("A grown-up needs to help select a project key for movie magic! (GCP with billing)");
      await (window as any).aistudio.openSelectKey();
    }

    setIsVideoLoading(true);
    setVideoProgressMsg("Preparing the magic movie studio...");
    try {
      const videoUrl = await GeminiService.generateStoryVideo(activeStory, (msg) => setVideoProgressMsg(msg));
      const updatedStory = { ...activeStory, videoUrl, updatedAt: Date.now() };
      StorageService.saveStory(updatedStory);
      setActiveStory(updatedStory);
      setShowVideoModal(true);
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found")) {
        alert("We need to pick the project key again!");
        await (window as any).aistudio.openSelectKey();
      } else {
        setApiError("The magic projector is warming up. Try again in a minute!");
      }
    } finally {
      setIsVideoLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full flex-1 overflow-hidden bg-black/20">
      <aside className="w-full md:w-80 bg-[#06181f]/95 text-white flex flex-col p-6 shadow-2xl border-r border-teal-900/50 z-20 backdrop-blur-md">
        <div className="flex items-center gap-4 mb-10 p-4 bg-teal-950/50 rounded-3xl border border-teal-800">
          <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-orange-400 bg-white shadow-inner flex items-center justify-center">
            <img src={getAvatarUrl()} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <p className="font-kids text-3xl truncate">{kid.nickname}</p>
        </div>
        
        <button 
          onClick={() => { setActiveStory(null); setIsCreatingNew(true); setNewMode('selection'); setApiError(null); }} 
          disabled={isLoading || isVideoLoading}
          className={`w-full py-5 mb-8 bg-orange-500 text-white rounded-3xl font-bold text-2xl shadow-xl transition-all border-b-4 border-orange-800 active:border-b-0 font-kids ${isLoading || isVideoLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-600 active:scale-95'}`}
        >
          ✨ New Adventure
        </button>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
          <h4 className="text-xs font-bold text-teal-500 uppercase tracking-widest px-2 mb-2">My Tales</h4>
          {stories.map(s => (
            <div key={s.id} className="relative group flex items-center gap-2 mb-1">
              <button 
                onClick={() => { setActiveStory({ ...s }); setIsCreatingNew(false); setApiError(null); }} 
                className={`flex-1 p-4 pr-12 text-left rounded-2xl transition-all border ${activeStory?.id === s.id ? 'bg-orange-400/30 border-orange-400 shadow-lg' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
              >
                <p className="font-bold text-white text-sm truncate">{s.title}</p>
              </button>
              <button 
                onClick={(e) => deleteStory(e, s.id)}
                className="absolute right-2 p-2 bg-red-900/40 text-rose-200 hover:text-white hover:bg-rose-600 rounded-xl transition-all shadow-sm flex items-center justify-center z-10"
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

      <section className="flex-1 flex flex-col h-full overflow-y-auto relative">
        <MascotBackground />
        
        {isVideoLoading && (
          <div className="fixed inset-0 z-[100] bg-teal-950/90 backdrop-blur-xl flex flex-col items-center justify-center text-center p-10">
            <div className="text-9xl animate-bounce mb-8">📽️</div>
            <h3 className="text-6xl font-kids text-white mb-4">Making Your Movie!</h3>
            <p className="text-3xl text-teal-200 font-storybook animate-pulse">{videoProgressMsg}</p>
            <div className="mt-12 w-full max-w-md h-4 bg-white/10 rounded-full overflow-hidden">
               <div className="h-full bg-orange-400 animate-progress w-full origin-left scale-x-50"></div>
            </div>
          </div>
        )}

        {!activeStory ? (
          <div className="p-10 max-w-6xl mx-auto w-full space-y-12 pb-20 relative z-10 flex flex-col items-center justify-start min-h-[70vh]">
            {!isCreatingNew ? (
              <div className="text-center space-y-12 animate-in fade-in zoom-in duration-500 w-full pt-12">
                <div className="space-y-4">
                  <h2 className="text-8xl font-kids text-white jungle-text-shadow">Welcome Hero!</h2>
                  <p className="text-4xl text-teal-100 font-storybook opacity-90">What adventure shall we imagine today?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl pt-8">
                  {TEMPLATES.map((t) => (
                    <button 
                      key={t.id}
                      onClick={() => handleStartStory({ templateId: t.id })}
                      className={`group p-6 bg-gradient-to-br ${t.color} border-4 border-white/30 rounded-[3rem] text-center hover:scale-105 transition-all shadow-2xl flex flex-col items-center gap-3 relative overflow-hidden h-[300px] justify-center`}
                    >
                      <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors pointer-events-none"></div>
                      <span className="text-8xl group-hover:rotate-12 transition-transform duration-300 relative z-10">{t.icon}</span>
                      <div className="relative z-10">
                        <h4 className="text-2xl font-kids text-white mb-1 leading-tight">{t.name}</h4>
                        <p className="text-white/80 font-storybook text-sm leading-tight opacity-70 group-hover:opacity-100 transition-opacity">{t.description}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex flex-col items-center gap-6 pt-12">
                   <p className="text-2xl font-kids text-teal-300 uppercase tracking-[0.2em] opacity-50">— OR —</p>
                   <button 
                    onClick={() => { setIsCreatingNew(true); setNewMode('selection'); }}
                    className="py-6 px-12 bg-white/10 hover:bg-white/20 backdrop-blur-md border-2 border-white/20 rounded-full text-white text-3xl font-kids transition-all hover:scale-105"
                   >
                     🚀 Custom Adventure
                   </button>
                </div>
              </div>
            ) : isLoading ? (
              <div className="flex flex-col items-center justify-center py-40 space-y-8">
                <div className="text-9xl animate-bounce">🪄</div>
                <h3 className="text-5xl font-kids text-white jungle-text-shadow">Weaving your magic...</h3>
              </div>
            ) : newMode === 'selection' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full animate-in slide-in-from-bottom-10 duration-500 pt-12">
                <button 
                  onClick={() => setShowCanvas({ active: true, isNewStory: true })}
                  className="group p-10 rounded-[4rem] border-4 border-white/20 bg-white/10 backdrop-blur-md shadow-2xl hover:scale-105 transition-all text-center space-y-4"
                >
                  <span className="text-9xl block group-hover:rotate-12 transition-transform">🎨</span>
                  <h3 className="text-6xl font-kids text-white">Draw a Story</h3>
                  <p className="text-2xl text-teal-100 opacity-80">Your drawing starts the adventure!</p>
                </button>
                <button 
                  onClick={() => setNewMode('writing')}
                  className="group p-10 rounded-[4rem] border-4 border-white/20 bg-white/10 backdrop-blur-md shadow-2xl hover:scale-105 transition-all text-center space-y-4"
                >
                  <span className="text-9xl block group-hover:-rotate-12 transition-transform">✍️</span>
                  <h3 className="text-6xl font-kids text-white">Write a Story</h3>
                  <p className="text-2xl text-teal-100 opacity-80">Start typing your own special idea!</p>
                </button>
                <button onClick={() => setIsCreatingNew(false)} className="md:col-span-2 py-6 text-white font-bold text-3xl font-kids opacity-70 hover:opacity-100">← Back to Home</button>
              </div>
            ) : newMode === 'writing' ? (
              <div className="max-w-4xl w-full bg-white/10 backdrop-blur-xl p-12 rounded-[4rem] border-4 border-white/20 shadow-2xl space-y-10 animate-in zoom-in-95">
                <div className="text-center">
                   <h3 className="text-6xl font-kids text-white mb-2">My Magical Tale ✍️</h3>
                   <p className="text-2xl text-teal-100 opacity-80 font-storybook">How does your adventure begin?</p>
                </div>
                <textarea 
                  autoFocus
                  className="w-full h-64 p-10 bg-white rounded-[3rem] text-4xl font-storybook text-teal-950 outline-none border-8 border-teal-100 focus:border-orange-400 shadow-inner resize-none placeholder:text-gray-300"
                  placeholder="Once upon a time, there was a..."
                  value={userInput}
                  onChange={e => setUserInput(e.target.value)}
                />
                <div className="flex gap-6">
                  <button onClick={() => setNewMode('selection')} className="flex-1 py-4 text-2xl font-kids text-teal-200">Cancel</button>
                  <button 
                    onClick={() => handleStartStory({ customPrompt: userInput })}
                    disabled={!userInput.trim()}
                    className="flex-[2] py-8 bg-orange-500 text-white rounded-[2.5rem] font-bold text-4xl font-kids shadow-xl border-b-8 border-orange-700 active:border-b-0 active:translate-y-2 transition-all disabled:opacity-50"
                  >
                    Start the Story! 🚀
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full animate-in slide-in-from-bottom-10 duration-500 pt-12">
                <button onClick={() => setNewMode('selection')} className="md:col-span-2 py-4 text-white font-bold text-2xl font-kids opacity-70 hover:opacity-100">← Back</button>
                {TEMPLATES.map(t => (
                  <button 
                    key={t.id} onClick={() => handleStartStory({ templateId: t.id })}
                    className={`group p-8 rounded-[3rem] border-4 border-white/20 bg-gradient-to-br ${t.color} hover:scale-105 transition-all text-left flex items-center gap-6 shadow-xl`}
                  >
                    <span className="text-7xl group-hover:scale-110 transition-transform">{t.icon}</span>
                    <div>
                      <h4 className="text-4xl font-kids text-white">{t.name}</h4>
                      <p className="text-white opacity-80 text-xl font-storybook">{t.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-6 pb-64 relative z-10">
            <header className="mb-10 flex flex-col gap-6 glass-card p-8 rounded-[3rem] shadow-2xl sticky top-4 z-30">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
                {editingTitle ? (
                  <input 
                    autoFocus className="bg-white text-teal-900 text-4xl font-kids p-2 rounded-xl border-4 border-orange-400 outline-none w-full shadow-inner"
                    value={activeStory.title} onChange={(e) => updateStoryTitle(e.target.value)}
                    onBlur={() => setEditingTitle(false)} onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(false)}
                  />
                ) : (
                  <div className="flex items-center gap-4 cursor-pointer" onClick={() => setEditingTitle(true)}>
                    <h2 className="text-4xl md:text-5xl font-kids text-teal-950 truncate">{activeStory.title}</h2>
                    <span className="text-2xl opacity-50">✏️</span>
                  </div>
                )}
                <div className="flex flex-wrap justify-center gap-3 items-center">
                  {/* Playback Speed Control */}
                  <div className="flex flex-col items-center bg-teal-50/50 px-4 py-1.5 rounded-2xl border border-teal-100 shadow-inner">
                    <span className="text-[10px] font-bold text-teal-800 uppercase tracking-tighter mb-0.5">Speed: {playbackSpeed}x</span>
                    <input 
                      type="range" min="0.7" max="2.0" step="0.1" value={playbackSpeed} 
                      onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                      className="w-24 h-1.5 bg-teal-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                    />
                  </div>
                  <button 
                    onClick={handleGenerateMovie}
                    disabled={isVideoLoading}
                    className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-3 rounded-full font-bold shadow-xl text-2xl font-kids flex items-center gap-2 transition-all hover:scale-110 active:scale-95"
                    title="Animate your story!"
                  >
                    🎬 Magic Movie
                  </button>
                  {isSpeaking ? <button onClick={stopSpeaking} className="bg-rose-600 text-white px-6 py-3 rounded-full font-bold shadow-xl text-xl font-kids">Stop</button> :
                    <button onClick={() => speakText(activeStory.scenes[activeStory.scenes.length - 1]?.text || "")} className="bg-teal-600 text-white px-6 py-3 rounded-full font-bold shadow-xl text-xl font-kids">🔊 Listen</button>
                  }
                  <button 
                    onClick={(e) => deleteStory(e, activeStory.id)}
                    className="bg-rose-100 text-rose-600 px-4 py-3 rounded-full font-bold shadow-sm hover:bg-rose-600 hover:text-white transition-all text-xl"
                    title="Delete this story"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </header>

            <div className="space-y-12">
              {activeStory.scenes.map((scene) => (
                <div key={scene.id} className="glass-card p-10 rounded-[4rem] shadow-2xl relative group">
                  <div className="absolute top-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setEditingSceneId(editingSceneId === scene.id ? null : scene.id)}
                      className="p-3 bg-teal-50 text-teal-600 rounded-2xl hover:bg-teal-600 hover:text-white transition-all shadow-sm font-bold"
                    >
                      ✏️ Edit
                    </button>
                  </div>

                  {editingSceneId === scene.id ? (
                    <div className="space-y-4">
                      <textarea 
                        autoFocus
                        className="w-full p-6 bg-white rounded-3xl text-3xl font-storybook text-teal-950 outline-none border-4 border-orange-400 shadow-inner resize-none min-h-[200px]"
                        value={scene.text}
                        onChange={(e) => handleUpdateSceneText(scene.id, e.target.value)}
                      />
                      <button 
                        onClick={() => setEditingSceneId(null)}
                        className="px-8 py-3 bg-orange-500 text-white rounded-2xl font-bold font-kids text-xl shadow-lg"
                      >
                        Done Editing ✨
                      </button>
                    </div>
                  ) : (
                    <p className="text-4xl text-teal-950 leading-relaxed font-storybook">{scene.text}</p>
                  )}

                  {scene.imageUrl ? (
                    <div className="mt-8 rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl bg-white aspect-video flex items-center justify-center">
                      <img src={scene.imageUrl} className="w-full h-full object-contain" />
                    </div>
                  ) : <button onClick={() => setShowCanvas({ active: true, sceneId: scene.id })} className="mt-8 text-2xl font-kids text-teal-600 border-4 border-teal-100 px-10 py-4 rounded-3xl active:scale-95 transition-all">Draw a picture! 🎨</button>}
                </div>
              ))}
              
              {isLoading && <div className="text-teal-200 text-5xl font-kids text-center py-10 animate-pulse">Adding some magic... ✨</div>}
            </div>

            <div className="fixed bottom-0 left-0 md:left-80 right-0 p-10 bg-gradient-to-t from-black/50 to-transparent z-40 pointer-events-none">
              <div className="max-w-4xl mx-auto w-full flex items-center gap-4 md:gap-6 glass-card p-6 rounded-[4rem] shadow-2xl border-4 border-orange-400 pointer-events-auto">
                <button onClick={() => setShowCanvas({ active: true })} className="p-4 md:p-6 bg-orange-500 text-white rounded-3xl text-3xl md:text-4xl shadow-lg active:scale-90">🎨</button>
                <textarea 
                  className="flex-1 p-4 md:p-6 bg-transparent outline-none text-teal-950 font-storybook text-2xl md:text-3xl placeholder:text-gray-400 resize-none h-16 md:h-20 flex items-center" 
                  placeholder="What happens next? Write it here..." 
                  value={userInput} 
                  onChange={e => setUserInput(e.target.value)}
                />
                <button onClick={() => handleContinue()} disabled={isLoading || isVideoLoading || !userInput.trim()} className="p-6 md:p-8 bg-teal-600 text-white rounded-3xl shadow-xl text-2xl md:text-3xl border-b-8 border-teal-900 disabled:opacity-50 active:scale-95 transition-all">🚀</button>
              </div>
            </div>
          </div>
        )}
      </section>

      {showVideoModal && activeStory?.videoUrl && (
        <div className="fixed inset-0 z-[110] bg-black/95 flex flex-col items-center justify-center p-6 backdrop-blur-3xl">
           <div className="w-full max-w-6xl aspect-video relative group animate-in zoom-in-95">
              <video src={activeStory.videoUrl} controls autoPlay className="w-full h-full rounded-[3rem] shadow-[0_0_80px_rgba(255,165,0,0.3)] border-4 border-white/20" />
              <button onClick={() => setShowVideoModal(false)} className="absolute -top-16 right-0 text-white text-5xl font-kids hover:text-orange-400 transition-colors">✕ Close</button>
           </div>
           <div className="mt-12 text-center space-y-4">
             <h2 className="text-6xl font-kids text-white jungle-text-shadow">Your Movie is Ready! 📽️</h2>
             <button onClick={handleGenerateMovie} className="mt-6 px-10 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-kids text-3xl shadow-2xl transition-all">Remix Magic ✨</button>
           </div>
        </div>
      )}

      {showCanvas.active && (
        <DrawingCanvas 
          onSave={(data) => {
            if (showCanvas.isNewStory) {
              setShowCanvas({ active: false });
              handleStartStory({ drawing: data });
            } else if (showCanvas.sceneId) {
              const updatedScenes = activeStory!.scenes.map(s => s.id === showCanvas.sceneId ? { ...s, imageUrl: data } : s);
              const updatedStory = { ...activeStory!, scenes: updatedScenes, updatedAt: Date.now() };
              setActiveStory(updatedStory);
              StorageService.saveStory(updatedStory);
              setShowCanvas({ active: false });
            } else {
              setShowCanvas({ active: false });
              handleContinue("I drew a special picture!", data);
            }
          }} 
          onClose={() => setShowCanvas({ active: false })} 
        />
      )}
    </div>
  );
};

export default StoryStudio;
