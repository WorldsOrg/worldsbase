"use client";
import React, { useCallback } from "react";
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge, BackgroundVariant } from "reactflow";
import TextUpdaterNode from "./TextUpdaterNode";

import "reactflow/dist/style.css";

const nodeTypes = { textUpdater: TextUpdaterNode };

const initialNodes = [
  { id: "node-1", type: "textUpdater", position: { x: 0, y: 0 }, data: { value: 123, title: "Insert" } },
  { id: "node-2", type: "textUpdater", position: { x: 225, y: 225 }, data: { value: 123, title: "Update" } },
  { id: "node-3", type: "textUpdater", position: { x: 525, y: 525 }, data: { value: 123, title: "Delete" } },
];

const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

export default function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect}>
        <Controls />
        <MiniMap />
        <Background variant={"dots" as BackgroundVariant} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
