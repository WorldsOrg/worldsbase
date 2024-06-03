"use client";
import React, { useCallback, useEffect, useState } from "react";
import ReactFlow, { Background, addEdge, BackgroundVariant } from "reactflow";
import { isEmpty } from "lodash";
import TableNode from "./nodes/TableNode";
import "reactflow/dist/style.css";
import StickyNoteNode from "./nodes/StickyNoteNode";
import Dropdown from "./Dropdown";
import { useTable } from "@/context/tableContext";
import TriggerNode from "./nodes/TriggerNode";
import axiosInstance from "@/utils/axiosInstance";
import WalletNode from "./nodes/WalletNode";
import SendTokenNode from "./nodes/SendTokenNode";
import Loading from "@/components/ui/Loading";
import { useToastContext } from "@/context/toastContext";
import CronNode from "./nodes/CronNode";
import FunctionNode from "./nodes/FunctionNode";
import { useWorkflow } from "@/hooks/useWorkflow";
import WorkflowModal from "@/components/workflow/WorkflowModal";
import BatchMintNode from "./nodes/BatchMintNode";
import TransferPackNode from "./nodes/TransferPackNode";

const nodeTypes = {
  tableNode: TableNode,
  stickyNote: StickyNoteNode,
  triggerNode: TriggerNode,
  walletNode: WalletNode,
  tokenNode: SendTokenNode,
  cronNode: CronNode,
  functionNode: FunctionNode,
  batchMintNode: BatchMintNode,
  transferPackNode: TransferPackNode,
};

export default function Flow({ params }: { params: { id: string } }) {
  const flowId = params.id;
  const { nodes, onNodesChange, edges, onEdgesChange, flowName, setFlowName, setNodes, setEdges, flowFound } = useWorkflow(params.id);
  const { navigation, functions } = useTable();
  const [showNameModal, setShowNameModal] = useState(false);

  const [saveLoading, setSaveLoading] = useState(false);
  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), []);

  const { toastAlert } = useToastContext();

  useEffect(() => {
    getWorkflows();
  }, [navigation, flowId, flowFound]);

  const getWorkflows = async () => {
    if (flowFound) {
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
            type: "tableNode",
            position: { x: window.innerWidth + 350, y: window.innerHeight - 300 },
            data: { method: "insert" },
          },
        ]);
        break;
      case "Update":
        setNodes((n) => [
          ...n,
          {
            id: (n.length + 1).toString(),
            type: "tableNode",
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
            type: "tableNode",
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
      case "Wallet":
        setNodes((n) => [
          ...n,
          {
            id: (n.length + 100).toString(),
            type: "walletNode",
            position: { x: window.innerWidth + 350, y: window.innerHeight - 300 },
            data: {
              userId: "",
            },
          },
        ]);
        break;
        case "TransferPack":
          setNodes((n) => [
            ...n,
            {
              id: (n.length + 100).toString(),
              type: "transferPackNode",
              position: { x: window.innerWidth + 350, y: window.innerHeight - 300 },
              data: {
                userId: "",
              },
            },
          ]);
          break;
      case "Token":
        setNodes((n) => [
          ...n,
          {
            id: (n.length + 100).toString(),
            type: "tokenNode",
            position: { x: window.innerWidth + 350, y: window.innerHeight - 300 },
            data: {
              userId: "",
            },
          },
        ]);
        break;
      case "BatchMint":
        setNodes((n) => [
          ...n,
          {
            id: (n.length + 100).toString(),
            type: "batchMintNode",
            position: { x: window.innerWidth + 350, y: window.innerHeight - 300 },
            data: {
              tables: navigation,
            },
          },
        ]);
        break;
      case "Cron":
        setNodes((n) => [
          ...n,
          {
            id: (n.length + 100).toString(),
            type: "cronNode",
            position: { x: window.innerWidth + 350, y: window.innerHeight - 300 },
            data: {
              schedule: "0 * * * *",
              functions: functions,
              function: functions[0]?.["Function Name"],
            },
          },
        ]);
        break;
      case "Function":
        setNodes((n) => [
          ...n,
          {
            id: (n.length + 100).toString(),
            type: "functionNode",
            position: { x: window.innerWidth + 350, y: window.innerHeight - 300 },
            data: {
              tables: navigation,
            },
          },
        ]);
        break;
    }
  };

  const handleSave = async (name: string) => {
    if (isEmpty(name)) {
      return setShowNameModal(true);
    }
    try {
      setSaveLoading(true);
      setFlowName(name);
      const short_id = generateShortId();
      const trigger = nodes.filter((node) => node.type === "triggerNode");
      const cron = nodes.filter((node) => node.type === "cronNode");
      if (trigger.length === 0 && cron.length === 0) {
        return toastAlert(false, "A flow must have a trigger or cron node!");
      }

      if (trigger.length > 1) {
        return toastAlert(false, "A flow can only have one trigger node!");
      }

      if (cron.length > 1) {
        return toastAlert(false, "A flow can only have one cron node!");
      }

      if (trigger.length > 0) {
        console.log(trigger[0].data);
        const tableName = trigger[0].data.table;
        const method = trigger[0].data.method;
        const filter = trigger[0].data.filter ? trigger[0].data.filter : null;

        let condition = null;
        if (filter !== null) {
          condition = createConditionString(filter);
        }

        const triggerPayload = {
          tableName: tableName,
          triggerName: short_id,
          method: method,
          condition: condition,
        };

        const payload = {
          data: {
            id: flowId,
            short_id: short_id,
            name,
            nodes: nodes,
            edges: edges,
            type: "trigger",
            table_name: tableName
          },
          tableName: "workflows",
        };

        const requests = [axiosInstance.post(`/table/addtrigger`, triggerPayload), axiosInstance.post(`/table/insertdata/`, payload)];

        const responses = await Promise.all(requests);

        const allSuccessful = responses.every((response) => response?.status === 201);

        if (!allSuccessful) {
          return toastAlert(false, "Flow could not be saved!");
        }

        setFlowName(name);

        return toastAlert(true, `"${name}" saved.`);
      } else if (cron && cron.length > 0) {
        const cronNode = cron[0];

        const cronPayload = {
          function: cronNode.data.function,
          schedule: cronNode.data.schedule,
        };

        const result = await axiosInstance.post(`/db/cron`, cronPayload);

        const payload = {
          data: {
            id: flowId,
            short_id: short_id,
            name,
            nodes: nodes,
            edges: edges,
            type: "cron",
            cron_id: result.data.id,
          },
          tableName: "workflows",
        };

        const response = await axiosInstance.post(`/table/insertdata/`, payload);

        if (response.status !== 201) {
          return toastAlert(false, "Flow could not be saved!");
        }

        return toastAlert(true, `"${name}" saved.`);
      }
    } catch (e) {
      toastAlert(false, "Something went wrong!");
    } finally {
      setShowNameModal(false);
      setSaveLoading(false);
    }
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

      if (conditions.filter === "NotEquals" && value === "NULL") {
        return `${column} IS NOT NULL`;
      }

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

  if (saveLoading) {
    return <Loading />;
  }

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <div className="flex items-center justify-between h-12 px-2 text-white bg-black">
        <div className="text-lg font-semibold">{isEmpty(flowName) ? "New Flow" : flowName}</div>
        <div className="flex items-center">
          <Dropdown handleAdd={handleAdd} />
          <button className="px-2 m-1 font-semibold text-black rounded-md dark:bg-primary bg-contrastPrimary h-9" onClick={() => handleSave(flowName)}>
            Save Flow
          </button>
        </div>
      </div>

      <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} fitView nodeTypes={nodeTypes}>
        <Background variant={"dots" as BackgroundVariant} gap={12} size={1} />
      </ReactFlow>

      <WorkflowModal isOpen={showNameModal} onClose={() => setShowNameModal(false)} onSave={handleSave} />
    </div>
  );
}
