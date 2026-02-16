# Obsidian Workflow AI Architect 2026 🧠🕸️

O **Obsidian Workflow AI Architect** é uma ferramenta avançada de brainstorming e arquitetura de sistemas que utiliza o poder do **Gemini 3.0** para transformar ideias abstratas em workflows visuais e documentação estruturada pronta para o **Obsidian**.

## ✨ Funcionalidades principais

- **Brainstorming com IA:** Converse com o Gemini 3.0 para idealizar processos, sistemas ou planos de negócios.
- **Visualização em Tempo Real:** Gera automaticamente um grafo (nós e conexões) usando React Flow conforme a conversa evolui.
- **Persistência Local:** Seus projetos são salvos automaticamente no navegador (LocalStorage), com opção de renomear e excluir.
- **Suporte a Markdown:** Chat rico com suporte a formatação, tabelas e blocos de código.
- **Anexo de Arquivos:** Envie documentos `.md`, `.txt` ou `.json` para servir de contexto para a arquitetura.
- **Exportação para Obsidian:** 
  - Gera um arquivo `.canvas` nativo do Obsidian 1.0.
  - Cria notas `.md` com **Frontmatter (YAML)** otimizado para os plugins *Dataview* e *Smart Connections*.

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React 18, TypeScript, Vite.
- **Estilização:** Tailwind CSS v4.
- **IA:** Google Gemini SDK (@google/genai 1.41.0).
- **Processamento:** JSZip, React Markdown, React Flow.

## 🚀 Como iniciar

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/Vit0lze/Obsidian-Workflow-AI-Architect.git
    cd obsidian-workflow-ai-architect
    ```
2.  **Instale as dependências:**
    ```bash
    npm install
    ```
3.  **Configure a API Key:**
    - Crie um arquivo `.env.local` na raiz.
    - Adicione sua chave do Google AI Studio:
      ```env
      VITE_GEMINI_API_KEY=seu_token_aqui
      ```
4.  **Inicie o ambiente de desenvolvimento:**
    ```bash
    npm run dev
    ```

## 📝 Especificações Técnicas (Pesquisa 2026)

Este projeto implementa:
- **Thought Signatures:** Para evitar truncamento de JSON em workflows complexos.
- **Obsidian Canvas 1.0 Spec:** Mapeamento de coordenadas absolutas e cores semânticas (1-6).
- **Ontologia de Metadados:** YAML estruturado para máxima interoperabilidade.

---

# Obsidian Workflow AI Architect 2026 🧠🕸️ (English Version)

The **Obsidian Workflow AI Architect** is an advanced brainstorming and systems architecture tool that leverages the power of **Gemini 3.0** to transform abstract ideas into visual workflows and structured documentation ready for **Obsidian**.

## ✨ Key Features

- **AI Brainstorming:** Talk to Gemini 3.0 to ideate processes, systems, or business plans.
- **Real-time Visualization:** Automatically generates a graph (nodes and connections) using React Flow as the conversation evolves.
- **Local Persistence:** Projects are automatically saved in your browser (LocalStorage), with options to rename and delete.
- **Markdown Support:** Rich chat interface supporting formatting, tables, and code blocks.
- **File Attachments:** Upload `.md`, `.txt`, or `.json` documents to serve as context for the architecture.
- **Obsidian Export:** 
  - Generates a native Obsidian 1.0 `.canvas` file.
  - Creates `.md` notes with **Frontmatter (YAML)** optimized for *Dataview* and *Smart Connections* plugins.

## 🛠️ Technologies Used

- **Frontend:** React 18, TypeScript, Vite.
- **Styling:** Tailwind CSS v4.
- **AI:** Google Gemini SDK (@google/genai 1.41.0).
- **Processing:** JSZip, React Markdown, React Flow.

## 🚀 How to Start

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Vit0lze/Obsidian-Workflow-AI-Architect.git
    cd obsidian-workflow-ai-architect
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure the API Key:**
    - Create a `.env.local` file in the root directory.
    - Add your Google AI Studio key:
      ```env
      VITE_GEMINI_API_KEY=your_token_here
      ```
4.  **Start the development environment:**
    ```bash
    npm run dev
    ```

## 📝 Technical Specifications (2026 Research)

This project implements:
- **Thought Signatures:** To prevent JSON truncation in complex workflows.
- **Obsidian Canvas 1.0 Spec:** Absolute coordinate mapping and semantic colors (1-6).
- **Metadata Ontology:** Structured YAML for maximum interoperability.
