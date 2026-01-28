
import { KidProfile, Story } from '../types';

const KEYS = {
  KIDS: 'tinytales_kids',
  STORIES: 'tinytales_stories',
  PARENT_PASS: 'tinytales_passcode'
};

export const StorageService = {
  getKids: (): KidProfile[] => {
    const data = localStorage.getItem(KEYS.KIDS);
    return data ? JSON.parse(data) : [];
  },
  saveKid: (kid: KidProfile) => {
    const kids = StorageService.getKids();
    const existingIndex = kids.findIndex(k => k.id === kid.id);
    if (existingIndex > -1) kids[existingIndex] = kid;
    else kids.push(kid);
    localStorage.setItem(KEYS.KIDS, JSON.stringify(kids));
  },
  deleteKid: (id: string) => {
    const kids = StorageService.getKids().filter(k => k.id !== id);
    localStorage.setItem(KEYS.KIDS, JSON.stringify(kids));
    // Also delete stories for this kid
    const stories = StorageService.getStories().filter(s => s.kidProfileId !== id);
    localStorage.setItem(KEYS.STORIES, JSON.stringify(stories));
  },
  getStories: (): Story[] => {
    const data = localStorage.getItem(KEYS.STORIES);
    return data ? JSON.parse(data) : [];
  },
  getStoriesByKid: (kidId: string): Story[] => {
    return StorageService.getStories().filter(s => s.kidProfileId === kidId);
  },
  saveStory: (story: Story) => {
    const stories = StorageService.getStories();
    const index = stories.findIndex(s => s.id === story.id);
    if (index > -1) stories[index] = story;
    else stories.push(story);
    localStorage.setItem(KEYS.STORIES, JSON.stringify(stories));
  },
  deleteStory: (id: string) => {
    const stories = StorageService.getStories().filter(s => s.id !== id);
    localStorage.setItem(KEYS.STORIES, JSON.stringify(stories));
  }
};
