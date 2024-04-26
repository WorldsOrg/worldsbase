"use client";
import React, { useCallback, useEffect } from "react";
import ReactFlow, { Background, useNodesState, useEdgesState, addEdge, BackgroundVariant } from "reactflow";
import TextUpdaterNode from "./TextUpdaterNode";
import "reactflow/dist/style.css";
import StickyNoteNode from "./StickyNoteNode";
import Dropdown from "./Dropdown";
import { useTable } from "@/context/tableContext";
import TriggerNode from "./TriggerNode";
import axiosInstance from "@/utils/axiosInstance";

const nodeTypes = {
  textUpdater: TextUpdaterNode,
  stickyNote: StickyNoteNode,
  triggerNode: TriggerNode,
};

export default function Flow({ params }: { params: { id: string } }) {
  const flowId = params.id;
  const { navigation } = useTable();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), []);

  useEffect(() => {
    getWorkflows();
  }, [navigation, flowId]);

  const getWorkflows = async () => {
    const result = await axiosInstance.get(`/table/gettablevalue/workflows/id/${flowId}`);
    if (result.data[0]) {
      setNodes(result.data[0].nodes);
      setEdges(result.data[0].edges);
    } else {
      if (navigation && navigation.length > 0 && nodes.length === 0) {
        addTriggerNode();
        handleAdd("Note");
      }
    }
  };

  const addTriggerNode = () => {
    setNodes((n) => [
      ...n,
      {
        id: "1",
        type: "triggerNode",
        position: { x: window.innerWidth - 100, y: window.innerHeight },
        data: {
          table: "wtf_users",
          method: "insert",
          tables: navigation,
        },
      },
    ]);
  };

  const handleAdd = (type: string) => {
    if (nodes.some((node) => node.type === "triggerNode" && type === "Trigger")) {
      alert("You can only have one trigger node in a flow.");
      return;
    }

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
            id: (n.length + 100).toString(),
            type: "stickyNote",
            className: "annotation",
            position: { x: window.innerWidth + 350, y: window.innerHeight - 300 },
            data: {
              text: "Double click to add/edit text on the stick note. You can use this note to add comments or notes.",
            },
          },
        ]);
        break;
      case "Trigger":
        setNodes((n) => [
          ...n,
          {
            id: "1",
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

  const handleSave = async () => {
    const payload = {
      data: {
        id: flowId,
        name: `flow_${Math.floor(Math.random() * 1000)}`,
        nodes: nodes,
        edges: edges,
      },
      tableName: "workflows",
    };

    const result = await axiosInstance.post(`/table/insertdata/`, payload);
  };

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <div className="bg-black h-12 text-white flex flex-row justify-between px-2">
        <input className="bg-black" defaultValue="flow name" readOnly />
        <div>
          <Dropdown handleAdd={handleAdd} />
          <button className="bg-primary p-2 rounded-md m-1 text-white" onClick={handleSave}>
            save
          </button>
          <button className="bg-primary p-2 rounded-md m-1 text-white">delete</button>
          <button className="bg-primary p-2 rounded-md m-1 text-white">play</button>
          <button className="bg-primary p-2 rounded-md m-1 text-white">stop</button>
          <button className="bg-primary p-2 rounded-md m-1 text-white">errors</button>
        </div>
      </div>

      <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} fitView nodeTypes={nodeTypes}>
        <Background variant={"dots" as BackgroundVariant} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
