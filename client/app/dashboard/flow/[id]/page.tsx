"use client";
import React, { useCallback, useEffect, useState } from "react";
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
  const [flowName, setFlowName] = useState("Enter Flow Name");
  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), []);

  useEffect(() => {
    getWorkflows();
  }, [navigation, flowId]);

  const getWorkflows = async () => {
    const result = await axiosInstance.get(`/table/gettablevalue/workflows/id/${flowId}`);
    console.log(result);
    if (result.data[0]) {
      setNodes(result.data[0].nodes);
      setEdges(result.data[0].edges);
      setFlowName(result.data[0].name);
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
    const short_id = generateShortId();
    const trigger = nodes.filter((node) => node.type === "triggerNode");
    const tableName = trigger[0].data.table;
    const method = trigger[0].data.method;
    const filter = trigger[0].data.filter ? trigger[0].data.filter : null;
    let condition = null;
    if (filter !== null) {
      condition = createConditionString(filter);
    }
    const payload = {
      data: {
        id: flowId,
        short_id: short_id,
        name: flowName ? flowName : `flow_${short_id}`,
        nodes: nodes,
        edges: edges,
        table_name: flowName ? flowName : `flow_${short_id}`,
        operation: method,
      },
      tableName: "workflows",
    };

    const triggerPayload = {
      tableName: tableName,
      triggerName: short_id,
      method: method,
      condition: condition,
    };

    const triggerResult = await axiosInstance.post(`/table/addtrigger`, triggerPayload);
    console.log(triggerResult);
    const result = await axiosInstance.post(`/table/insertdata/`, payload);
    console.log(result);
  };

  const generateShortId = () => {
    // Start with a random letter (a-z)
    let id = String.fromCharCode(97 + Math.floor(Math.random() * 26));

    // Add random alphanumeric characters (a-z, 0-9)
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    const length = 8; // total length of ID, adjust as necessary

    for (let i = 1; i < length; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return id;
  };

  const createConditionString = (conditions: any) => {
    const operators: { [key: string]: string } = {
      Equals: "=",
      Bigger: ">",
      Smaller: "<",
      NotEquals: "!=",
    };

    if (operators[conditions.filter] && conditions.column && conditions.value !== undefined) {
      // Assume that the column needs to be prefixed with 'NEW.'
      let column = `NEW.${conditions.column}`;

      let value = conditions.value;
      if (typeof value === "string") {
        if (/^\d+$/.test(value)) {
          column = `CAST(${column} AS INTEGER)`;
          value = parseInt(value, 10); // Convert string to integer
        } else {
          value = `'${value.replace(/'/g, "''")}'`;
        }
      } else if (typeof value === "number" && Number.isInteger(value)) {
        value = `CAST(${value} AS INTEGER)`;
      }
      return `${column} ${operators[conditions.filter]} ${value}`;
    }
    throw new Error(`Invalid conditions: ${conditions}`);
  };

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <div className="bg-black h-12 text-white flex flex-row justify-between px-2">
        <input className="bg-black" value={flowName} onChange={(e) => setFlowName(e.target.value)} />
        <div>
          <Dropdown handleAdd={handleAdd} />
          <button className="bg-primary p-2 rounded-md m-1 text-white" onClick={handleSave}>
            Save Flow
          </button>
        </div>
      </div>

      <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} fitView nodeTypes={nodeTypes}>
        <Background variant={"dots" as BackgroundVariant} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
