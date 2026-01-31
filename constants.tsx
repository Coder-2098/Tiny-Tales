
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

export const STORY_STARTERS = [
  "A brave puppy finds a hidden map in the garden...",
  "A tiny robot accidentally lands on a planet made of candy...",
  "A cat discovers she can talk to birds in the park...",
  "A magical paintbrush brings every drawing to life...",
  "A group of squirrels builds a secret treehouse city...",
  "An explorer finds a door in the attic that leads to a forest...",
  "A friendly dragon who is afraid of fire but loves to bake cakes...",
  "A little owl who decides to stay awake during the day...",
];

export const TEMPLATES: StoryTemplate[] = [
  {
    id: 'chocolate',
    name: 'Chocolate Factory',
    icon: '🍫',
    description: 'A world of rivers of fudge and candy clouds!',
    character: 'A clever inventor with a purple hat',
    setting: 'The Gigantic Wonky Chocolate Factory',
    goal: 'Find the recipe for the Never-Ending Lollipop',
    mood: 'Yummy & Fun',
    color: 'from-amber-800 to-orange-500'
  },
  {
    id: 'honey_forest',
    name: 'Honey Bear Forest',
    icon: '🍯',
    description: 'Visit a silly old bear in a sunny woods!',
    character: 'A friendly yellow bear with a red shirt',
    setting: 'The Hundred-Acre Sunbeam Forest',
    goal: 'Find a missing pot of sweet golden honey',
    mood: 'Sweet & Calm',
    color: 'from-yellow-400 to-amber-600'
  },
  {
    id: 'berry_village',
    name: 'Berry Sweet Village',
    icon: '🍓',
    description: 'Everything here smells like fresh fruit!',
    character: 'A girl with a big pink hat and red curls',
    setting: 'The Strawberry Patch Village',
    goal: 'Bake the biggest berry pie for the festival',
    mood: 'Happy & Bright',
    color: 'from-rose-500 to-pink-400'
  },
  {
    id: 'space_quest',
    name: 'Space Adventure',
    icon: '🚀',
    description: 'Blast off past the stars and moon!',
    character: 'Ziggy the brave star-pilot',
    setting: 'The Galaxy of Sparkling Planets',
    goal: 'Fix the spaceship and return to Earth',
    mood: 'Exciting & Grand',
    color: 'from-indigo-900 to-blue-600'
  },
  {
    id: 'underwater',
    name: 'Ocean Adventure',
    icon: '🧜‍♀️',
    description: 'Dive into the deep blue mystery!',
    character: 'A curious mermaid explorer',
    setting: 'The Glow-in-the-Dark Coral Reef',
    goal: 'Find the Pearl of Whispers',
    mood: 'Magical',
    color: 'from-blue-600 to-cyan-500'
  },
  {
    id: 'agent',
    name: 'Secret Agent',
    icon: '🕵️',
    description: 'Solve a big mystery at HQ!',
    character: 'Agent Sparkle the fox',
    setting: 'The Sky High Gadget Tower',
    goal: 'Stop the invisible bandit',
    mood: 'Mysterious',
    color: 'from-slate-700 to-indigo-600'
  },
  {
    id: 'horror',
    name: 'Spooky Mansion',
    icon: '👻',
    description: 'A friendly ghost adventure!',
    character: 'A brave child with a flashlight',
    setting: 'The Giggle-Ghost Manor',
    goal: 'Solve the case of the missing cookies',
    mood: 'Spooky but fun',
    color: 'from-purple-900 to-indigo-900'
  }
];

export const AGE_BANDS = [
  { value: AgeBand.EARLY, label: 'Ages 5-7' },
  { value: AgeBand.MIDDLE, label: 'Ages 8-10' },
  { value: AgeBand.OLDER, label: 'Ages 11-12' }
];
