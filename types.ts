export interface WorkflowNode {
  id: string;
  label: string;
  type: 'concept' | 'task' | 'question' | 'output';
  description: string;
  x: number;
  y: number;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface ProjectFile {
  filename: string; // e.g., "summary.md"
  title: string;
  content: string; // Markdown content
  type: 'summary' | 'detail' | 'faq' | 'config';
}

export interface AIResponse {
  assistant_message: string;
  project_title: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  files: ProjectFile[];
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export type GeminiModel = 'gemini-3-flash-preview' | 'gemini-2.5-flash';

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  files: ProjectFile[];
  lastUpdated: number;
}

export interface AppState {
  sessions: ChatSession[];
  currentSessionId: string;
  isLoading: boolean;
  selectedNodeId: string | null;
  selectedModel: GeminiModel;
}
