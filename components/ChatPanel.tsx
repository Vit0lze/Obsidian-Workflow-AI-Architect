import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Bot, User, ChevronDown, Cpu, Paperclip, X, Sidebar } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Message, GeminiModel } from '../types';
import { t } from '../utils/i18n';

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  selectedModel: GeminiModel;
  onModelChange: (model: GeminiModel) => void;
  toggleSidebar: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ 
  messages, 
  onSendMessage, 
  isLoading,
  selectedModel,
  onModelChange,
  toggleSidebar
}) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<{ name: string, content: string }[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  const models: { id: GeminiModel; label: string; desc: string }[] = [
    { id: 'gemini-3-flash-preview', label: 'Gemini 3 Flash', desc: t('models.flash3') },
    { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', desc: t('models.flash25') },
  ];
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = t('newProject').includes('Novo') ? 'pt-BR' : 'en-US';
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((input.trim() || attachedFiles.length > 0) && !isLoading) {
      let fullMessage = input;
      if (attachedFiles.length > 0) {
        fullMessage += `\n\n---\n${t('attachedFiles')}:\n` + attachedFiles.map(f => `${t('file')}: ${f.name}\n${t('content')}:\n${f.content}`).join('\n\n');
      }
      onSendMessage(fullMessage);
      setInput('');
      setAttachedFiles([]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAttachedFiles(prev => [...prev, { name: file.name, content: ev.target?.result as string }]);
      };
      reader.readAsText(file);
    });
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-700 w-full md:w-[450px] flex-shrink-0">
      <div className="p-4 border-b border-gray-800 bg-gray-900 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={toggleSidebar} className="p-1.5 hover:bg-gray-800 rounded-md text-gray-400">
            <Sidebar size={18} />
          </button>
          <div>
            <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              AI Architect
            </h2>
          </div>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
            className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 px-2 py-1 rounded text-[10px] font-medium transition-colors"
          >
            <Cpu size={12} className="text-blue-400" />
            <span>{models.find(m => m.id === selectedModel)?.label.replace('Gemini ', '') || 'Model'}</span>
            <ChevronDown size={10} className={`transition-transform ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {isModelDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-xl z-50 py-1">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    onModelChange(model.id);
                    setIsModelDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-700 flex flex-col transition-colors ${
                    selectedModel === model.id ? 'bg-blue-600/10' : ''
                  }`}
                >
                  <span className={`text-xs font-semibold ${selectedModel === model.id ? 'text-blue-400' : 'text-gray-200'}`}>
                    {model.label}
                  </span>
                  <span className="text-[9px] text-gray-500">{model.desc}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-blue-600'}`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`p-4 rounded-2xl text-sm max-w-[85%] leading-relaxed prose prose-invert prose-sm ${
              msg.role === 'user' ? 'bg-indigo-600/20 text-indigo-50 border border-indigo-500/20' : 'bg-gray-800/50 text-gray-200 border border-gray-700'
            }`}>
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-3 text-gray-500 text-sm italic p-2">
            <Bot size={16} className="animate-bounce" />
            <span>{t('thinking')}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-800 bg-gray-900/50">
        {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
                {attachedFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-gray-800 border border-gray-700 px-2 py-1 rounded-md text-[10px]">
                        <span className="truncate max-w-[100px]">{f.name}</span>
                        <button onClick={() => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-gray-500 hover:text-red-400">
                            <X size={12} />
                        </button>
                    </div>
                ))}
            </div>
        )}
        
        <form onSubmit={handleSubmit} className="relative flex flex-col gap-2 bg-gray-800 border border-gray-700 rounded-2xl p-2 focus-within:border-blue-500 transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                }
            }}
            placeholder={t('placeholder')}
            className="w-full bg-transparent border-none px-3 py-2 text-sm text-white focus:outline-none resize-none min-h-[40px]"
            disabled={isLoading}
          />
          
          <div className="flex items-center justify-between px-2 pb-1">
            <div className="flex items-center gap-2">
                <label className="p-2 hover:bg-gray-700 rounded-full cursor-pointer text-gray-400 transition-colors">
                    <Paperclip size={18} />
                    <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                </label>
                <button
                    type="button"
                    onClick={toggleListening}
                    className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'hover:bg-gray-700 text-gray-400'}`}
                >
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
            </div>
            
            <button
                type="submit"
                disabled={(!input.trim() && attachedFiles.length === 0) || isLoading}
                className="p-2 bg-blue-600 rounded-xl text-white hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
                <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
