import JSZip from 'jszip';
import { WorkflowNode, WorkflowEdge, ProjectFile } from '../types';

export const generateObsidianVault = async (
  title: string,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  files: ProjectFile[]
) => {
  const zip = new JSZip();
  const folderName = title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'workflow_project';
  const root = zip.folder(folderName);

  if (!root) return null;

  // 1. Create Markdown Files
  files.forEach((file) => {
    // Ensure .md extension
    const filename = file.filename.endsWith('.md') ? file.filename : `${file.filename}.md`;
    root.file(filename, file.content);
  });

  // 2. Create Obsidian Canvas File
  // Convert React Flow nodes/edges to Obsidian Canvas JSON format
  const canvasNodes = nodes.map((node) => {
    // Find if there is a related file for this node to link it
    const relatedFile = files.find(f => 
      f.title.toLowerCase().includes(node.label.toLowerCase()) || 
      node.label.toLowerCase().includes(f.title.toLowerCase())
    );

    const baseNode = {
      id: node.id,
      x: node.x,
      y: node.y,
      width: 250,
      height: 140,
      color: getNodeColor(node.type),
    };

    if (relatedFile) {
      return {
        ...baseNode,
        type: 'file',
        file: relatedFile.filename.endsWith('.md') ? relatedFile.filename : `${relatedFile.filename}.md`,
      };
    } else {
      return {
        ...baseNode,
        type: 'text',
        text: `## ${node.label}\n\n${node.description}`,
      };
    }
  });

  const canvasEdges = edges.map((edge) => ({
    id: edge.id,
    fromNode: edge.source,
    fromSide: 'right', // Standard mapping from React Flow logic
    toNode: edge.target,
    toSide: 'left',
    label: edge.label,
  }));

  const canvasData = {
    nodes: canvasNodes,
    edges: canvasEdges,
  };

  root.file(`${title || 'workflow'}.canvas`, JSON.stringify(canvasData, null, 2));

  // 3. Generate Zip
  const content = await zip.generateAsync({ type: 'blob' });
  return content;
};

const getNodeColor = (type: string) => {
  switch (type) {
    case 'concept': return '6'; // Purple - High level theory
    case 'task': return '4';    // Green - Validated data/tasks
    case 'question': return '3'; // Yellow - Review required
    case 'output': return '5';   // Cyan - External info/references
    default: return '2';        // Orange - Hypotheses
  }
};
