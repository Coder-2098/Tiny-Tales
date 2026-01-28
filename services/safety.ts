
import { APP_CONFIG } from "../config/app.config";

export const SafetyService = {
  redactPII: (text: string): { redactedText: string; foundPII: boolean } => {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;
    
    let redacted = text;
    let found = false;

    if (emailRegex.test(text)) {
      redacted = redacted.replace(emailRegex, APP_CONFIG.SAFETY.REDACTION_LABELS.EMAIL);
      found = true;
    }
    if (phoneRegex.test(text)) {
      redacted = redacted.replace(phoneRegex, APP_CONFIG.SAFETY.REDACTION_LABELS.PHONE);
      found = true;
    }

    return { redactedText: redacted, foundPII: found };
  },

  isSafeContent: (text: string): boolean => {
    const lower = text.toLowerCase();
    return !APP_CONFIG.SAFETY.BLOCKLIST.some(word => lower.includes(word));
  }
};
