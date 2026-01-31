
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
    color: 'from-amber-800 to-orange-500',
    startingText: "Deep in the heart of the city stood a factory that smelled like toasted marshmallows and melted fudge. Inside, a clever inventor adjusted their purple hat and looked at a river of swirling liquid chocolate. Today was the day to find the secret recipe for the Never-Ending Lollipop!"
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
    color: 'from-yellow-400 to-amber-600',
    startingText: "In a forest where the sun always felt like a warm hug, a friendly yellow bear woke up with a very rumbly tummy. He checked his cupboard, but every single pot was empty! 'Oh bother,' he said, putting on his favorite red shirt. He needed to find some sweet golden honey, and he needed it now."
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
    color: 'from-rose-500 to-pink-400',
    startingText: "Welcome to Berry Sweet Village, where the houses are shaped like giant strawberries and the air smells like fresh jam. A girl with bouncy red curls and a big pink hat stood in her kitchen. The Great Berry Festival was starting tomorrow, and she had a plan to bake the biggest, tastiest pie anyone had ever seen!"
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
    color: 'from-indigo-900 to-blue-600',
    startingText: "The countdown reached zero! With a giant WHOOSH, Ziggy's rocket ship blasted through the clouds and into a sea of twinkling stars. But suddenly, a strange purple light flashed on the dashboard. 'Uh oh,' Ziggy said, looking out at the Galaxy of Sparkling Planets. The engine was making a funny whistling sound!"
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
    color: 'from-blue-600 to-cyan-500',
    startingText: "Deep beneath the waves, where the coral reefs glowed like neon lights, a curious mermaid swam past a group of giggling jellyfish. She had heard legends of the Pearl of Whispers hidden in a secret cave. With a flip of her tail, she set off on a quest to find the treasure!"
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
    color: 'from-slate-700 to-indigo-600',
    startingText: "High above the clouds in the Gadget Tower, Agent Sparkle the fox checked her high-tech watch. The alarm was beeping! Someone—or something—had sneaked into the top-secret cookie vault. It was time to use her invisible-ink scanner and catch the bandit!"
  }
];

export const AGE_BANDS = [
  { value: AgeBand.EARLY, label: 'Ages 5-7' },
  { value: AgeBand.MIDDLE, label: 'Ages 8-10' },
  { value: AgeBand.OLDER, label: 'Ages 11-12' }
];
