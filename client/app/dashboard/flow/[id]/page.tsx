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

  const onInit = (reactFlowInstance: any) => console.log("flow loaded:", reactFlowInstance.zoomTo(-10));

  useEffect(() => {
    getWorkflows();
  }, [navigation, flowId]);

  const getWorkflows = async () => {
    const result = await axiosInstance.get(`/table/gettablevalue/workflows/id/${flowId}`);
    if (result.data[0]) {
      console.log(result.data[0].nodes);
      setNodes(result.data[0].nodes);
      setEdges(result.data[0].edges);
    } else {
      console.log("else");
      if (navigation && navigation.length > 0 && nodes.length === 0) addTriggerNode();
    }
  };

  const addTriggerNode = () => {
    setNodes((n) => [
      ...n,
      {
        id: (n.length + 1).toString(),
        type: "triggerNode",
        position: { x: window.innerWidth - 100, y: window.innerHeight },
        data: {
          table: "",
          method: "insert",
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

  const handleSave = async () => {
    console.log(nodes, edges, flowId);
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
    console.log(result);
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

      <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onInit={onInit} fitView nodeTypes={nodeTypes}>
        <Background variant={"dots" as BackgroundVariant} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
