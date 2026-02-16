import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  MarkerType,
} from 'reactflow';
import { WorkflowNode, WorkflowEdge } from '../types';

interface WorkflowCanvasProps {
  nodesData: WorkflowNode[];
  edgesData: WorkflowEdge[];
  onNodeClick: (nodeId: string) => void;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  nodesData,
  edgesData,
  onNodeClick,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Sync React Flow state with props
  useEffect(() => {
    const flowNodes: Node[] = nodesData.map((n) => ({
      id: n.id,
      position: { x: n.x, y: n.y },
      data: { label: n.label, type: n.type },
      type: 'default', // Using default for simplicity, allows input/output handles
      style: getNodeStyle(n.type),
    }));

    const flowEdges: Edge[] = edgesData.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      type: 'smoothstep',
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
      animated: true,
      style: { stroke: '#64748b', strokeWidth: 2 },
    }));

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [nodesData, edgesData, setNodes, setEdges]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onNodeClick(node.id);
    },
    [onNodeClick]
  );

  return (
    <div className="w-full h-full bg-gray-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        fitView
        attributionPosition="bottom-right"
      >
        <Background color="#334155" gap={20} />
        <Controls className="bg-gray-800 border-gray-700 fill-white [&_button]:bg-gray-800 [&_button]:border-gray-700 [&_button]:fill-gray-200 [&_button:hover]:bg-gray-700" />
        <MiniMap 
          nodeColor={(n) => {
             if(n.style?.background) return n.style.background as string;
             return '#fff';
          }}
          className="bg-gray-900 border-gray-700"
          maskColor="rgba(0,0,0, 0.7)"
        />
      </ReactFlow>
    </div>
  );
};

// Helper to style nodes based on type
const getNodeStyle = (type: string) => {
  const baseStyle = {
    color: '#fff',
    border: '1px solid transparent',
    borderRadius: '12px',
    padding: '12px',
    fontSize: '13px',
    fontWeight: '500',
    width: 160,
    textAlign: 'center' as const,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  };

  switch (type) {
    case 'concept':
      return { ...baseStyle, background: '#7c3aed', borderColor: '#8b5cf6' }; // Purple
    case 'task':
      return { ...baseStyle, background: '#059669', borderColor: '#10b981' }; // Green
    case 'question':
      return { ...baseStyle, background: '#db2777', borderColor: '#ec4899' }; // Pink
    case 'output':
      return { ...baseStyle, background: '#d97706', borderColor: '#f59e0b' }; // Amber
    default:
      return { ...baseStyle, background: '#1e293b', borderColor: '#475569' };
  }
};