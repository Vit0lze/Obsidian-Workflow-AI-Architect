import { GoogleGenAI, Type } from "@google/genai";
import type { Schema } from "@google/genai";
import { AIResponse, WorkflowNode, WorkflowEdge, ProjectFile } from "../types";

const SYSTEM_INSTRUCTION = `
You are an expert Systems Architect and Project Manager AI. 
Your goal is to interview the user to build a comprehensive project workflow and documentation set.

LANGUAGE:
- Detect the user's language (e.g., Portuguese, English) and reply in the same language.
- If the user speaks Portuguese, all node labels, descriptions, and messages must be in Portuguese.

BEHAVIOR:
1.  **Collaborative:** Ask clarifying questions if the user's idea is vague. Don't just generate generic workflows; tailor them.
2.  **Visual Thinker:** Always update the graph (nodes/edges) to reflect the current state of the brainstorming.
3.  **Documenter:** Generate Markdown files representing the knowledge base of the project.
    - EVERY file must start with a YAML Frontmatter block containing:
      - **type**: category of note (concetto, referencia, tarefa)
      - **status**: 'IA-gerada' or 'Revisar'
      - **topics**: array of tags without #
      - **confidence**: score 0-1 of AI certainty
      - **summary**: 2-line executive summary for Smart Connections
    - Use [[WikiLinks]] to link between files.
4.  **Obsidian Expert:** The output will be used in Obsidian Canvas. 

OUTPUT SCHEMA RULES:
- **assistant_message**: Your conversational response to the user. Use Markdown for formatting.
- **project_title**: A concise title for the current project.
- **nodes**: The visual nodes for the canvas. Spread them out logically using x/y coordinates (approx -500 to 500 range).
- **edges**: Connections between nodes.
- **files**: Create specific markdown files. 

Provide the COMPLETE state of the graph and files in every response to ensure synchronization.
`;

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    assistant_message: { type: Type.STRING },
    project_title: { type: Type.STRING },
    nodes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          label: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['concept', 'task', 'question', 'output'] },
          description: { type: Type.STRING },
          x: { type: Type.NUMBER },
          y: { type: Type.NUMBER },
        },
        required: ['id', 'label', 'type', 'x', 'y'],
      },
    },
    edges: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          source: { type: Type.STRING },
          target: { type: Type.STRING },
          label: { type: Type.STRING },
        },
        required: ['id', 'source', 'target'],
      },
    },
    files: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          filename: { type: Type.STRING },
          title: { type: Type.STRING },
          content: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['summary', 'detail', 'faq', 'config'] },
        },
        required: ['filename', 'title', 'content', 'type'],
      },
    },
  },
  required: ['assistant_message', 'nodes', 'edges', 'files', 'project_title'],
};

export const sendMessageToGemini = async (
  history: { role: string; content: string }[],
  currentContext: { nodes: WorkflowNode[], files: ProjectFile[] },
  model: string = 'gemini-3-pro-preview'
): Promise<AIResponse> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });

  const contextMessage = `
    Current Graph State: ${JSON.stringify(currentContext.nodes.map(n => n.label))}
    Current Files: ${JSON.stringify(currentContext.files.map(f => f.filename))}
    Update the project based on the user's latest input.
  `;

  const contents = [
    ...history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    })),
    { role: 'user', parts: [{ text: contextMessage }] }
  ];

  try {
    const isGemma = model.includes('gemma');
    const isThinkingModel = model.includes('pro') || model.includes('2.5') || model.includes('3');
    
    if (isGemma && contents.length > 0) {
        contents[0].parts[0].text = `${SYSTEM_INSTRUCTION}\n\n${contents[0].parts[0].text}`;
    }

    const config: any = {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      // @ts-ignore
      includeThought: isThinkingModel,
    };

    if (!isGemma) {
      config.systemInstruction = SYSTEM_INSTRUCTION;
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: config,
    });

    const jsonText = response.text || "{}";
    return JSON.parse(jsonText) as AIResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};