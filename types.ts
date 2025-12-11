export interface Anomaly {
  code: string; // e.g., "B.3.3.6 a2"
  description: string;
  severity: 'DANGER' | 'AVERTISSEMENT' | 'INFO';
  recommendation: string;
}

export interface AnalysisResult {
  id: string;
  timestamp: number;
  imageUrl: string; // Base64 for display
  equipmentDetected: string[];
  compliant: boolean;
  anomalies: Anomaly[];
  summary: string; // "Professional summary for copy-paste"
  technicalNotes: string; // Sections, brands, specific values
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum ViewState {
  HOME = 'HOME',
  ANALYSIS_RESULT = 'ANALYSIS_RESULT',
  CHAT = 'CHAT',
  REPORT = 'REPORT'
}