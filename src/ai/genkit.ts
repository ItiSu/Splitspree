import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Only initialize AI in server-side contexts
export const ai = typeof window === 'undefined' 
  ? genkit({
      plugins: [googleAI()],
      model: 'googleai/gemini-2.0-flash',
    })
  : null;
