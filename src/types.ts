export interface Distortion {
  name: string;
  explanation: string;
}

export interface Reframing {
  type: string;
  text: string;
}

export interface ReframeResponse {
  originalThought: string;
  distortions: Distortion[];
  reframings: Reframing[];
}

export interface JournalEntry {
  id: string;
  date: string; // ISO String
  moodBefore: number; // 1 to 5
  moodAfter: number; // 1 to 5
  feelings: string[];
  originalThought: string;
  detectedDistortions: Distortion[];
  allReframings: Reframing[];
  chosenReframing: string;
  notes?: string;
}
