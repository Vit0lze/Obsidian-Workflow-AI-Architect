import React from 'react';
import { X, FileText, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ProjectFile } from '../types';

interface FilePreviewProps {
  file?: ProjectFile;
  onClose: () => void;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ file, onClose }) => {
  if (!file) return null;

  return (
    <div className="absolute top-0 right-0 h-full w-full md:w-[600px] bg-gray-900/95 backdrop-blur-md border-l border-gray-700 shadow-2xl transform transition-transform duration-300 flex flex-col z-50">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-2 text-blue-400">
          <FileText size={20} />
          <h3 className="font-bold text-lg text-white">{file.title}</h3>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-400 uppercase tracking-wider">
                {file.type}
            </span>
            <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
            >
            <X size={20} />
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <article className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown 
            components={{
              a: ({node, ...props}) => <span className="text-blue-400 underline cursor-pointer" {...props} />
            }}
          >
            {file.content}
          </ReactMarkdown>
        </article>
      </div>
      
      <div className="p-4 border-t border-gray-800 bg-gray-900/50 text-xs text-gray-500 text-center">
        Previewing {file.filename}
      </div>
    </div>
  );
};
