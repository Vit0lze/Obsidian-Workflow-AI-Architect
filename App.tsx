import React, { useState, useCallback, useEffect } from 'react';
import { Download, Plus, Trash2, Edit3, MessageSquare, Menu } from 'lucide-react';
import './index.css';
import { ChatPanel } from './components/ChatPanel';
import { WorkflowCanvas } from './components/WorkflowCanvas';
import { FilePreview } from './components/FilePreview';
import { sendMessageToGemini } from './services/geminiService';
import { generateObsidianVault } from './utils/exportService';
import { AppState, ChatSession, Message, ProjectFile } from './types';
import { t } from './utils/i18n';

const STORAGE_KEY = 'obsidian_architect_sessions';

function App() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load sessions", e);
      }
    }
    const initialId = crypto.randomUUID();
    return {
      sessions: [{
        id: initialId,
        title: t('newWorkflow'),
        messages: [{
          role: 'assistant',
          content: t('assistantGreeting'),
          timestamp: Date.now(),
        }],
        nodes: [],
        edges: [],
        files: [],
        lastUpdated: Date.now(),
      }],
      currentSessionId: initialId,
      isLoading: false,
      selectedNodeId: null,
      selectedModel: 'gemini-3-flash-preview',
    };
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | undefined>(undefined);

  const currentSession = state.sessions.find(s => s.id === state.currentSessionId) || state.sessions[0];

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const createNewSession = () => {
    const newId = crypto.randomUUID();
    const newSession: ChatSession = {
      id: newId,
      title: t('newWorkflow'),
      messages: [{
        role: 'assistant',
        content: t('assistantGreeting'),
        timestamp: Date.now(),
      }],
      nodes: [],
      edges: [],
      files: [],
      lastUpdated: Date.now(),
    };
    setState(prev => ({
      ...prev,
      sessions: [newSession, ...prev.sessions],
      currentSessionId: newId,
    }));
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setState(prev => {
      const filtered = prev.sessions.filter(s => s.id !== id);
      if (filtered.length === 0) {
          return prev; // Keep at least one
      }
      return {
        ...prev,
        sessions: filtered,
        currentSessionId: prev.currentSessionId === id ? filtered[0].id : prev.currentSessionId
      };
    });
  };

  const renameSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newTitle = prompt(t('rename'), currentSession.title);
    if (newTitle) {
      setState(prev => ({
        ...prev,
        sessions: prev.sessions.map(s => s.id === id ? { ...s, title: newTitle } : s)
      }));
    }
  };

  const handleSendMessage = async (text: string) => {
    const newUserMsg: Message = { role: 'user', content: text, timestamp: Date.now() };
    
    setState((prev) => ({
      ...prev,
      isLoading: true,
      sessions: prev.sessions.map(s => s.id === prev.currentSessionId ? {
        ...s,
        messages: [...s.messages, newUserMsg]
      } : s)
    }));

    try {
      const response = await sendMessageToGemini(
        [...currentSession.messages, newUserMsg].map(m => ({ role: m.role, content: m.content })),
        { nodes: currentSession.nodes, files: currentSession.files },
        state.selectedModel
      );

      const newAiMsg: Message = {
        role: 'assistant',
        content: response.assistant_message,
        timestamp: Date.now(),
      };

      setState((prev) => ({
        ...prev,
        isLoading: false,
        sessions: prev.sessions.map(s => s.id === prev.currentSessionId ? {
          ...s,
          title: response.project_title || s.title,
          messages: [...s.messages, newAiMsg],
          nodes: response.nodes,
          edges: response.edges,
          files: response.files, // Update with full state from AI
          lastUpdated: Date.now()
        } : s)
      }));

    } catch (error) {
      console.error(error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        sessions: prev.sessions.map(s => s.id === prev.currentSessionId ? {
          ...s,
          messages: [...s.messages, { role: 'assistant', content: t('error'), timestamp: Date.now() }]
        } : s)
      }));
    }
  };

  const handleNodeClick = useCallback((nodeId: string) => {
    const node = currentSession.nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const relatedFile = currentSession.files.find(
      (f) => f.title.toLowerCase().includes(node.label.toLowerCase()) || 
             node.label.toLowerCase().includes(f.title.toLowerCase())
    );

    if (relatedFile) {
      setSelectedFile(relatedFile);
    } else {
      setSelectedFile({
        filename: `temp-${node.id}.md`,
        title: node.label,
        content: `## ${node.label}\n\n${node.description}`,
        type: 'detail'
      });
    }
  }, [currentSession.nodes, currentSession.files]);

  const handleExport = async () => {
    const zipBlob = await generateObsidianVault(
      currentSession.title,
      currentSession.nodes,
      currentSession.edges,
      currentSession.files
    );
    
    if (zipBlob) {
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentSession.title.replace(/\s+/g, '_')}_Obsidian_Vault.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white font-sans overflow-hidden">
      {/* Sessions Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-gray-900 border-r border-gray-800 transition-all duration-300 flex flex-col overflow-hidden`}>
        <div className="p-4 border-b border-gray-800">
          <button 
            onClick={createNewSession}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 py-2 rounded-md transition-colors text-sm font-medium"
          >
            <Plus size={16} /> {t('newProject')}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {state.sessions.map(s => (
            <div 
              key={s.id}
              onClick={() => setState(prev => ({ ...prev, currentSessionId: s.id }))}
              className={`group flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                s.id === state.currentSessionId ? 'bg-indigo-600/20 text-indigo-300' : 'hover:bg-gray-800 text-gray-400'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <MessageSquare size={14} />
                <span className="truncate text-xs">{s.title}</span>
              </div>
              <div className="hidden group-hover:flex items-center gap-1">
                <button onClick={(e) => renameSession(s.id, e)} className="p-1 hover:text-white"><Edit3 size={12} /></button>
                <button onClick={(e) => deleteSession(s.id, e)} className="p-1 hover:text-red-400"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Panel */}
      <ChatPanel
        messages={currentSession.messages}
        onSendMessage={handleSendMessage}
        isLoading={state.isLoading}
        selectedModel={state.selectedModel}
        onModelChange={(model) => setState(prev => ({ ...prev, selectedModel: model }))}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative h-full">
        <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 z-20">
            <div className="flex items-center gap-3">
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-800 rounded-md text-gray-400 lg:hidden">
                    <Menu size={20} />
                </button>
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                <h1 className="font-semibold text-gray-200 truncate max-w-[200px] md:max-w-md">{currentSession.title}</h1>
            </div>
            
            <button
                onClick={handleExport}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
            >
                <Download size={16} />
                <span className="hidden sm:inline">{t('exportCanvas')}</span>
            </button>
        </header>

        <div className="flex-1 relative">
            <WorkflowCanvas 
                nodesData={currentSession.nodes} 
                edgesData={currentSession.edges}
                onNodeClick={handleNodeClick}
            />
            {selectedFile && (
                <FilePreview 
                    file={selectedFile} 
                    onClose={() => setSelectedFile(undefined)} 
                />
            )}
        </div>
      </div>
    </div>
  );
}

export default App;
