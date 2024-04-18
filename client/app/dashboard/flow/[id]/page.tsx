"use client";
import React, { useCallback, useEffect } from "react";
import ReactFlow, { Background, useNodesState, useEdgesState, addEdge, BackgroundVariant } from "reactflow";
import TextUpdaterNode from "./TextUpdaterNode";
import "reactflow/dist/style.css";
import StickyNoteNode from "./StickyNoteNode";
import Dropdown from "./Dropdown";
import { useTable } from "@/context/tableContext";
import TriggerNode from "./TriggerNode";
const nodeTypes = {
  textUpdater: TextUpdaterNode,
  stickyNote: StickyNoteNode,
  triggerNode: TriggerNode,
};

// const initialNodes = [
//   { id: "node-2", type: "textUpdater", position: { x: 400, y: 325 }, data: { label: "Insert" } },
//   { id: "node-3", type: "note", className: "annotation", position: { x: 400, y: 200 }, data: { label: "Hello from very cool note node" } },
// ];

export default function Flow() {
  const { navigation } = useTable();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), []);

  const onInit = (reactFlowInstance: any) => console.log("flow loaded:", reactFlowInstance.zoomTo(-10));

  useEffect(() => {
    console.log(nodes, edges);
  }, [nodes, edges]);

  useEffect(() => {
    if (navigation && navigation.length > 0 && nodes.length === 0) addTriggerNode();
  }, [navigation]);

  const addTriggerNode = () => {
    setNodes((n) => [
      ...n,
      {
        id: (n.length + 1).toString(),
        type: "triggerNode",
        position: { x: window.innerWidth - 100, y: window.innerHeight },

        data: {
          tables: navigation,
        },
      },
    ]);
  };

  const handleAdd = (type: string) => {
    switch (type) {
      case "Insert":
        setNodes((n) => [
          ...n,
          {
            id: (n.length + 1).toString(),
            type: "textUpdater",
            position: { x: window.innerWidth + 350, y: window.innerHeight - 300 },
            data: { label: "Insert" },
          },
        ]);
        break;
      case "Update":
        setNodes((n) => [
          ...n,
          {
            id: (n.length + 1).toString(),
            type: "textUpdater",
            position: { x: window.innerWidth + 350, y: window.innerHeight - 300 },
            data: { label: "Update" },
          },
        ]);
        break;
      case "Delete":
        setNodes((n) => [
          ...n,
          {
            id: (n.length + 1).toString(),
            type: "textUpdater",
            position: { x: window.innerWidth + 350, y: window.innerHeight - 300 },
            data: { label: "Delete" },
          },
        ]);
        break;
      case "Note":
        setNodes((n) => [
          ...n,
          {
            id: (n.length + 1).toString(),
            type: "stickyNote",
            className: "annotation",
            position: { x: window.innerWidth + 350, y: window.innerHeight - 300 },
            data: {
              label: "First node listens wtf_users table, inserting a new value triggers it and it calls the next node which assigns a weapon to newly created user. 🥳",
            },
          },
        ]);
        break;
      case "Trigger":
        setNodes((n) => [
          ...n,
          {
            id: (n.length + 1).toString(),
            type: "triggerNode",
            position: { x: window.innerWidth + 350, y: window.innerHeight - 300 },
            data: {
              tables: navigation,
            },
          },
        ]);
        break;
    }
  };

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <div className="bg-black h-12 text-white flex flex-row justify-between px-2">
        <input className="bg-black" value="flow name" />
        <div>
          <Dropdown handleAdd={handleAdd} />
          <button className="bg-primary p-2 rounded-md m-1 text-white">save</button>
          <button className="bg-primary p-2 rounded-md m-1 text-white">delete</button>
          <button className="bg-primary p-2 rounded-md m-1 text-white">play</button>
          <button className="bg-primary p-2 rounded-md m-1 text-white">stop</button>
          <button className="bg-primary p-2 rounded-md m-1 text-white">errors</button>
        </div>
      </div>

      <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onInit={onInit} fitView nodeTypes={nodeTypes}>
        <Background variant={"dots" as BackgroundVariant} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
