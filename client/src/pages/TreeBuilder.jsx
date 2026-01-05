import { useCallback, useMemo, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import FamilyMemberNode from '../components/FamilyMemberNode';
import Toolbar from '../components/Toolbar';
import { useTreeStore } from '../store/treeStore';

const nodeTypes = {
  familyMember: FamilyMemberNode,
};

export default function TreeBuilder() {
  const { tree, setSelectedPerson } = useTreeStore();

  // Convert tree data to React Flow format
  const initialNodes = useMemo(
    () =>
      tree.people.map((person) => ({
        id: person.id,
        type: 'familyMember',
        position: person.position || { x: 0, y: 0 },
        data: person,
      })),
    [tree.people]
  );

  const initialEdges = useMemo(
    () =>
      tree.relationships.map((rel) => ({
        id: rel.id,
        source: rel.from,
        target: rel.to,
        type: 'smoothstep',
        animated: false,
        style: {
          stroke: 'var(--color-border)',
          strokeWidth: 2,
        },
        label: rel.type,
      })),
    [tree.relationships]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when tree changes
  useMemo(() => {
    const newNodes = tree.people.map((person) => ({
      id: person.id,
      type: 'familyMember',
      position: person.position || { x: 0, y: 0 },
      data: person,
    }));
    setNodes(newNodes);
  }, [tree.people, setNodes]);

  // Update edges when relationships change
  useMemo(() => {
    const newEdges = tree.relationships.map((rel) => ({
      id: rel.id,
      source: rel.from,
      target: rel.to,
      type: 'smoothstep',
      animated: false,
      style: {
        stroke: 'var(--color-border)',
        strokeWidth: 2,
      },
    }));
    setEdges(newEdges);
  }, [tree.relationships, setEdges]);

  // Handle node position changes
  const onNodeDragStop = useCallback((event, node) => {
    const { updatePerson } = useTreeStore.getState();
    updatePerson(node.id, { position: node.position });
  }, []);

  // Handle pane click to deselect
  const onPaneClick = useCallback(() => {
    setSelectedPerson(null);
  }, [setSelectedPerson]);

  return (
    <div className="h-[calc(100vh-8rem)] w-full relative flex flex-col" ref={treeElementRef}>
      <Toolbar treeElement={treeElementRef.current} />
      <div className="flex-1 relative">
        <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-[var(--color-bg-primary)]"
      >
        <Background color="var(--color-border)" gap={20} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            return 'var(--color-accent)';
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
        </ReactFlow>
      </div>
    </div>
  );
}
