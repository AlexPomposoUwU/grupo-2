export type TabType = 'emergency' | 'compass' | 'signaling' | 'manuals' | 'simulator' | 'checklist' | 'ai';

export interface SurvivalItem {
  id: string;
  name: string;
  category: 'essenciais' | 'abrigo' | 'agua' | 'fogo' | 'saude' | 'sinalizacao';
  importance: 'critico' | 'alto' | 'medio';
  tip: string;
}

export interface ScenarioQuestion {
  id: number;
  situation: string;
  context: string;
  options: {
    text: string;
    isCorrect: boolean;
    explanation: string;
    points: number;
  }[];
}

export interface ManualSection {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  heroImage?: string;
  keyRule: string;
  steps: {
    title: string;
    description: string;
    warning?: string;
    tip?: string;
  }[];
  doList: string[];
  dontList: string[];
}
