
import { AgeBand, Story } from "../types";

export const PromptService = {
  getAgeInstruction: (ageBand: AgeBand): string => {
    switch (ageBand) {
      case AgeBand.EARLY: return "Simple words for 5-7 year olds.";
      case AgeBand.MIDDLE: return "Engaging story for 8-10 year olds.";
      case AgeBand.OLDER: return "Rich story for 11-12 year olds.";
      default: return "Simple words.";
    }
  },

  buildStorySystemInstruction: (story: Partial<Story>, visionContext: string, userPrompt: string): string => {
    const ageInstruction = PromptService.getAgeInstruction(story.ageBand || AgeBand.EARLY);
    return `You are a children's story writer.
Age level: ${ageInstruction}
Character: ${story.character}, Setting: ${story.setting}, Goal: ${story.goal}, Mood: ${story.mood}.
Story History: ${story.scenes?.map(s => s.text).join('\n')}
Drawing Context: ${visionContext ? `The child drew: ${visionContext}. Incorporate this into the narrative.` : 'No drawing provided.'}
Child's Input: ${userPrompt}

Task: Write the NEXT SHORT CHAPTER (approx 80-120 words). 
Rules:
1. Stay kid-safe and age-appropriate.
2. Do NOT use markdown or bold text.
3. Use a tone that matches the ${story.mood} mood.
4. End on a slight cliffhanger or prompt the next action.`;
  },

  getSuggestionPrompt: (lastSceneText: string): string => {
    return `Based on this story: "${lastSceneText}", provide 3 short, exciting ideas for what happens next (max 8 words each).`;
  },

  getImageDescriptionPrompt: (): string => {
    return "Describe this child's drawing in a supportive, imaginative way. Keep it simple and focused on key characters or objects.";
  },

  getHeroIconPrompt: (): string => {
    return "Create a high-quality, professional 3D Pixar-style character icon based on this sketch. Place on a vibrant, clean single-color background. The character should look friendly, heroic, and magical.";
  }
};
