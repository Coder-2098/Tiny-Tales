
export enum AgeBand {
  EARLY = '5-7',
  MIDDLE = '8-10',
  OLDER = '11-12'
}

export interface KidProfile {
  id: string;
  nickname: string;
  avatarId: string;
  ageBand: AgeBand;
}

export interface StoryScene {
  id: string;
  text: string;
  imageDescription?: string;
  imageUrl?: string;
  timestamp: number;
}

export interface Story {
  id: string;
  title: string;
  kidProfileId: string;
  createdAt: number;
  updatedAt: number;
  ageBand: AgeBand;
  scenes: StoryScene[];
  character: string;
  setting: string;
  goal: string;
  mood: string;
  videoUrl?: string;
  aiMetadata?: {
    safetyFlags: string[];
    lastPrompt: string;
  };
}

export interface StoryTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  character: string;
  setting: string;
  goal: string;
  mood: string;
  color: string;
}
