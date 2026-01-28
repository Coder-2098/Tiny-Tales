
import React from 'react';
import { AgeBand, StoryTemplate } from './types';

export const AVATARS = [
  { id: 'cat', name: 'Blue Cat', url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="%23b6e3f4"/><text y=".85em" x="5" font-size="80">🐱</text></svg>' },
  { id: 'mouse', name: 'Brown Mouse', url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="%23ffdfbf"/><text y=".85em" x="5" font-size="80">🐭</text></svg>' },
  { id: 'cow', name: 'Moo Cow', url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="%23fef3c7"/><text y=".85em" x="5" font-size="80">🐮</text></svg>' },
  { id: 'monkey', name: 'Cheeky Monkey', url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="%23d1d4f9"/><text y=".85em" x="5" font-size="80">🐵</text></svg>' },
  { id: 'pig', name: 'Pink Piggy', url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="%23ffd5dc"/><text y=".85em" x="5" font-size="80">🐷</text></svg>' },
  { id: 'dino', name: 'Green Dino', url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="%23d1fae5"/><text y=".85em" x="5" font-size="80">🦖</text></svg>' },
  { id: 'spaceship', name: 'Spaceship', url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="%23cffafe"/><text y=".85em" x="5" font-size="80">🚀</text></svg>' },
  { id: 'unicorn', name: 'Unicorn', url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="%23f5f3ff"/><text y=".85em" x="5" font-size="80">🦄</text></svg>' },
];

export const TEMPLATES: StoryTemplate[] = [
  {
    id: 'space',
    name: 'Space Adventure',
    icon: '🚀',
    description: 'Explore distant planets!',
    character: 'A brave astronaut named Ziggy',
    setting: 'A sparkling crystal planet',
    goal: 'Find the lost Star Crystal',
    mood: 'Exciting',
    color: 'bg-indigo-900 border-indigo-500 text-white'
  },
  {
    id: 'jungle',
    name: 'Jungle Quest',
    icon: '🐒',
    description: 'Rescue wild friends!',
    character: 'A swift ranger',
    setting: 'The Great Green Forest',
    goal: 'Find the backwards waterfall',
    mood: 'Brave',
    color: 'bg-emerald-900 border-emerald-500 text-white'
  },
  {
    id: 'chocolate',
    name: 'Chocolate World',
    icon: '🍫',
    description: 'A yummy sweet world!',
    character: 'A hungry little mouse',
    setting: 'The Candyland Valley',
    goal: 'Find the Golden Chocolate Bar',
    mood: 'Yummy',
    color: 'bg-orange-900 border-orange-500 text-white'
  },
  {
    id: 'forest-friend',
    name: 'Forest Friends',
    icon: '🦊',
    description: 'Find a buddy in the woods.',
    character: 'Finnegan the Fox',
    setting: 'The Whispering Woods',
    goal: 'Find someone to play hide and seek with',
    mood: 'Heartwarming',
    color: 'bg-green-800 border-green-400 text-white'
  },
  {
    id: 'agent',
    name: 'Secret Agent',
    icon: '🕵️',
    description: 'Solve a big mystery!',
    character: 'Agent Sparkle',
    setting: 'The Sky High Tower',
    goal: 'Find the invisible key',
    mood: 'Mysterious',
    color: 'bg-slate-900 border-slate-500 text-white'
  },
  {
    id: 'underwater',
    name: 'Ocean Mystery',
    icon: '🧜‍♀️',
    description: 'Dive into the deep blue!',
    character: 'A curious dolphin',
    setting: 'The Glow-in-the-Dark Coral Reef',
    goal: 'Find the Pearl of Whispers',
    mood: 'Magical',
    color: 'bg-blue-900 border-blue-400 text-white'
  },
  {
    id: 'dragon',
    name: 'The Dragon\'s Cake',
    icon: '🐉',
    description: 'Help a friendly dragon!',
    character: 'A clumsy little dragon',
    setting: 'The Cloud Castle Kitchen',
    goal: 'Bake the tallest birthday cake ever',
    mood: 'Funny',
    color: 'bg-rose-900 border-rose-400 text-white'
  },
  {
    id: 'robot',
    name: 'Robot School',
    icon: '🤖',
    description: 'A day with smart machines!',
    character: 'Bot-2000',
    setting: 'The High-Tech Tinkertown',
    goal: 'Learn how to paint with oil paints',
    mood: 'Curious',
    color: 'bg-cyan-900 border-cyan-400 text-white'
  }
];

export const AGE_BANDS = [
  { value: AgeBand.EARLY, label: 'Ages 5-7' },
  { value: AgeBand.MIDDLE, label: 'Ages 8-10' },
  { value: AgeBand.OLDER, label: 'Ages 11-12' }
];
