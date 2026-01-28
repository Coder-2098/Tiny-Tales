
export const APP_CONFIG = {
  APP_NAME: 'TinyTales Studio',
  MODELS: {
    STORY_GENERATION: 'gemini-3-flash-preview',
    SUGGESTIONS: 'gemini-3-flash-preview',
    IMAGE_INTERPRETATION: 'gemini-3-flash-preview',
    SPEECH: 'gemini-2.5-flash-preview-tts',
    IMAGE_GENERATION: 'gemini-2.5-flash-image',
  },
  AI_SETTINGS: {
    MAX_RETRIES: 3,
    INITIAL_RETRY_DELAY: 1000,
    TEMPERATURE: 0.8,
    SPEECH_SAMPLE_RATE: 24000,
    PLAYBACK_SPEED_DEFAULT: 1.1,
  },
  STORAGE_KEYS: {
    KIDS: 'tinytales_kids',
    STORIES: 'tinytales_stories',
    PARENT_PASSCODE: '1234',
  },
  SAFETY: {
    BLOCKLIST: ['hate', 'violence', 'blood', 'kill', 'death', 'stupid', 'idiot'],
    REDACTION_LABELS: {
      EMAIL: '[Email Hidden for Safety]',
      PHONE: '[Phone Hidden for Safety]',
    }
  }
};
