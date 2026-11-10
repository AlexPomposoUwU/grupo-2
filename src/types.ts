export interface Trigger {
  id: string;
  phrase: string;
  videoUrl: string;
  description: string;
  ambientSound?: "rain" | "birds" | "wind" | "cyber" | "none";
}

export interface PresetVideo {
  name: string;
  phrase: string;
  videoUrl: string;
  description: string;
  ambientSound: "rain" | "birds" | "wind" | "cyber" | "none";
}

export interface MessageLog {
  id: string;
  sender: "user" | "guardian";
  text: string;
  timestamp: string;
  matchedTriggerId?: string | null;
}

export type HybridResult = any;
export type ChatMessage = any;
export type TreeSpecimen = any;
export type DataNode = any;
export type Cyberdeck = any;
export type BioPlant = any;
export type TerminalLog = any;
