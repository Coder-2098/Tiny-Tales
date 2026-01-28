
import React, { useState, useEffect } from 'react';
import { KidProfile, Story, AgeBand } from '../types';
import { StorageService } from '../services/storage';
import { AVATARS, AGE_BANDS } from '../constants';

interface ParentDashboardProps {
  onExit: () => void;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({ onExit }) => {
  const [kids, setKids] = useState<KidProfile[]>([]);
  const [showAddKid, setShowAddKid] = useState(false);
  const [editingKid, setEditingKid] = useState<KidProfile | null>(null);
  const [newKid, setNewKid] = useState<KidProfile>({ id: '', nickname: '', avatarId: AVATARS[0].id, ageBand: AgeBand.EARLY });
  const [activeKidStories, setActiveKidStories] = useState<{ kid: KidProfile, stories: Story[] } | null>(null);
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setKids(StorageService.getKids());
  };

  const handleAddKid = () => {
    if (!newKid.nickname.trim()) return;
    const kid: KidProfile = { ...newKid, id: crypto.randomUUID() };
    StorageService.saveKid(kid);
    refreshData();
    setShowAddKid(false);
    setNewKid({ id: '', nickname: '', avatarId: AVATARS[0].id, ageBand: AgeBand.EARLY });
  };

  const handleUpdateKid = () => {
    if (!editingKid || !editingKid.nickname.trim()) return;
    StorageService.saveKid(editingKid);
    refreshData();
    setEditingKid(null);
  };

  const handleDeleteKid = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (window.confirm("Permanently delete this explorer and ALL their magical stories? 🗑️")) {
      StorageService.deleteKid(id);
      refreshData();
      if (activeKidStories?.kid.id === id) setActiveKidStories(null);
    }
  };

  const viewStories = (kid: KidProfile) => {
    const stories = StorageService.getStoriesByKid(kid.id);
    setActiveKidStories({ kid, stories });
  };

  const handleUpdateStoryTitle = (story: Story, newTitle: string) => {
    if (!newTitle.trim()) return;
    const updatedStory = { ...story, title: newTitle, updatedAt: Date.now() };
    StorageService.saveStory(updatedStory);
    
    setActiveKidStories(prev => {
      if (!prev) return null;
      return {
        ...prev,
        stories: prev.stories.map(s => s.id === story.id ? updatedStory : s)
      };
    });
  };

  /**
   * FIXED: This function now correctly handles the deletion and updates local state
   * to ensure the UI re-renders immediately without requiring a page refresh.
   */
  const handleDeleteStory = (e: React.MouseEvent, storyId: string, storyTitle: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm(`Are you sure you want to permanently delete "${storyTitle}"?`)) {
      // 1. Remove from local storage
      StorageService.deleteStory(storyId);
      
      // 2. Remove from the active modal state to update UI
      setActiveKidStories(prev => {
        if (!prev) return null;
        return {
          ...prev,
          stories: prev.stories.filter(s => s.id !== storyId)
        };
      });
    }
  };

  const getAvatarUrl = (avatarId: string) => {
    if (!avatarId) return AVATARS[0].url;
    if (avatarId.startsWith('data:')) return avatarId;
    const prebuilt = AVATARS.find(a => a.id === avatarId);
    return prebuilt ? prebuilt.url : AVATARS[0].url;
  };

  const handleCloseArchive = () => {
    setActiveKidStories(null);
    setEditingStoryId(null);
  };

  return (
    <div className="max-w-6xl mx-auto w-full p-6 md:p-10 pb-32">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 bg-white p-8 rounded-[3rem] shadow-sm border border-indigo-50">
        <div className="flex-1">
          <h2 className="text-5xl font-kids text-indigo-900">Parent Station ⚙️</h2>
          <p className="text-indigo-600 text-lg">Manage profiles and creative archives safely.</p>
        </div>
        <button 
          onClick={onExit} 
          className="px-10 py-4 bg-indigo-600 text-white rounded-full font-bold shadow-xl hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2"
        >
          <span>←</span> Close Dashboard
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <section className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-3xl font-kids text-indigo-950">Active Explorers</h3>
            <button 
              onClick={() => setShowAddKid(true)}
              className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 shadow-xl transition-all flex items-center gap-2"
            >
              <span>+</span> New Explorer
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {kids.map(kid => (
              <div key={kid.id} className="bg-white p-8 rounded-[2.5rem] border border-indigo-100 shadow-md flex flex-col gap-6 group hover:shadow-xl transition-all relative overflow-hidden">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-indigo-50 border-4 border-indigo-100 overflow-hidden shadow-inner flex-shrink-0 flex items-center justify-center">
                    <img src={getAvatarUrl(kid.avatarId)} className="w-full h-full object-cover" alt={`${kid.nickname}'s avatar`} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-bold text-3xl text-indigo-900 truncate">{kid.nickname}</h4>
                    <p className="text-base text-indigo-500 font-medium bg-indigo-50 w-fit px-3 py-1 rounded-full mt-2">Level: {kid.ageBand} yrs</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-2 pt-4 border-t border-indigo-50">
                  <button 
                    onClick={() => viewStories(kid)} 
                    className="w-full py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-bold text-sm hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                  >
                    📖 View Archives
                  </button>
                  <div className="flex gap-2 w-full">
                    <button 
                      onClick={() => setEditingKid(kid)} 
                      className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={(e) => handleDeleteKid(e, kid.id)} 
                      className="flex-1 py-3 bg-red-50 text-red-500 rounded-2xl font-bold text-sm hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="bg-indigo-950 p-10 rounded-[3rem] border-2 border-indigo-800 shadow-2xl space-y-8 h-fit text-white sticky top-10">
          <h3 className="text-3xl font-kids">Safety Hub 🛡️</h3>
          <ul className="space-y-6 text-indigo-300 font-medium text-lg leading-snug">
            <li className="flex gap-4">
              <span className="text-emerald-500 text-2xl">✓</span>
              <span>All tales are kid-safe and filtered.</span>
            </li>
            <li className="flex gap-4">
              <span className="text-emerald-500 text-2xl">✓</span>
              <span>Local storage only - we don't track.</span>
            </li>
          </ul>
        </aside>
      </div>

      {(showAddKid || editingKid) && (
        <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-indigo-950 rounded-[3rem] p-10 max-w-lg w-full shadow-2xl space-y-8 border-4 border-indigo-800">
            <h3 className="text-4xl font-kids text-white text-center">
              {showAddKid ? 'New Explorer' : 'Edit Hero'}
            </h3>
            <div className="space-y-6">
              <input 
                className="w-full p-5 rounded-2xl bg-indigo-900 border-2 border-indigo-800 text-white text-xl placeholder:text-indigo-800"
                value={showAddKid ? newKid.nickname : editingKid?.nickname || ''}
                onChange={e => showAddKid 
                  ? setNewKid({...newKid, nickname: e.target.value})
                  : setEditingKid(prev => prev ? {...prev, nickname: e.target.value} : null)
                }
                placeholder="Hero Name"
              />
              <select 
                className="w-full p-5 rounded-2xl bg-indigo-900 border-2 border-indigo-800 text-white text-xl"
                value={showAddKid ? newKid.ageBand : editingKid?.ageBand || AgeBand.EARLY}
                onChange={e => showAddKid
                  ? setNewKid({...newKid, ageBand: e.target.value as AgeBand})
                  : setEditingKid(prev => prev ? {...prev, ageBand: e.target.value as AgeBand} : null)
                }
              >
                {AGE_BANDS.map(band => <option key={band.value} value={band.value}>{band.label}</option>)}
              </select>
            </div>
            <div className="flex gap-4">
              <button onClick={() => { setShowAddKid(false); setEditingKid(null); }} className="flex-1 py-4 text-indigo-400 font-bold">Cancel</button>
              <button onClick={showAddKid ? handleAddKid : handleUpdateKid} className="flex-2 py-5 bg-pink-600 text-white rounded-2xl font-bold text-2xl">Save Profile</button>
            </div>
          </div>
        </div>
      )}

      {activeKidStories && (
        <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-indigo-950 rounded-[3rem] p-10 max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border-4 border-indigo-800">
            <div className="flex justify-between items-center mb-8 border-b border-indigo-800 pb-6 sticky top-0 bg-indigo-950 z-10">
              <h3 className="text-4xl font-kids text-white">Archives of {activeKidStories.kid.nickname}</h3>
              <button onClick={handleCloseArchive} className="p-4 bg-indigo-900 text-white rounded-full">✕</button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {activeKidStories.stories.length === 0 ? (
                <p className="text-indigo-400 italic text-xl py-20 text-center">No tales yet.</p>
              ) : (
                activeKidStories.stories.map(s => (
                  <div key={s.id} className="p-6 rounded-3xl border border-indigo-800 bg-indigo-900/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex-1">
                      {editingStoryId === s.id ? (
                        <input 
                          autoFocus
                          className="bg-indigo-950 text-white text-xl p-4 rounded-xl border-2 border-pink-500 w-full"
                          defaultValue={s.title}
                          onBlur={(e) => {
                            handleUpdateStoryTitle(s, e.target.value);
                            setEditingStoryId(null);
                          }}
                        />
                      ) : (
                        <div className="flex items-center gap-3">
                          <h4 className="font-bold text-2xl text-white">{s.title}</h4>
                          <button onClick={() => setEditingStoryId(s.id)} className="text-indigo-400 text-xs">✏️ Rename</button>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={(e) => handleDeleteStory(e, s.id, s.title)}
                        className="px-6 py-2 bg-rose-600/20 text-rose-400 rounded-xl font-bold text-sm border border-rose-900/50 hover:bg-rose-600 hover:text-white transition-all"
                      >
                        Delete Story
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;
