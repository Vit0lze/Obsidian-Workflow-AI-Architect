export const translations = {
  en: {
    newProject: "New Project",
    newWorkflow: "New Workflow",
    assistantGreeting: "Hello! I am your AI Architect. Tell me about your project idea, and I will help you brainstorm a workflow and structure it for Obsidian.",
    exportCanvas: "Export Obsidian Vault",
    thinking: "Architecting workflow...",
    placeholder: "Describe your project or attach a file...",
    attachedFiles: "Attached Files",
    file: "File",
    content: "Content",
    rename: "New title:",
    error: "Sorry, I encountered an error. Please try again.",
    models: {
      flash3: "Fast & efficient",
      flash25: "Stable & balanced"
    }
  },
  pt: {
    newProject: "Novo Projeto",
    newWorkflow: "Novo Workflow",
    assistantGreeting: "Olá! Sou seu Arquiteto de IA. Me conte sua ideia e eu ajudarei a criar um workflow para o Obsidian.",
    exportCanvas: "Exportar Vault Obsidian",
    thinking: "Arquitetando workflow...",
    placeholder: "Descreva seu projeto ou anexe um arquivo...",
    attachedFiles: "Arquivos Anexados",
    file: "Arquivo",
    content: "Conteúdo",
    rename: "Novo título:",
    error: "Desculpe, encontrei um erro. Tente novamente.",
    models: {
      flash3: "Rápido e eficiente",
      flash25: "Estável e equilibrado"
    }
  }
};

export const getLanguage = () => {
  const lang = navigator.language || (navigator as any).userLanguage;
  return lang.startsWith('pt') ? 'pt' : 'en';
};

export const t = (key: string) => {
  const lang = getLanguage();
  const keys = key.split('.');
  let result: any = translations[lang];
  for (const k of keys) {
    result = result[k];
  }
  return result || key;
};
