"use client";
import React, { useCallback, useEffect, useState } from "react";
import ReactFlow, { Background, useNodesState, useEdgesState, addEdge, BackgroundVariant } from "reactflow";
import { isEmpty } from "lodash";
import { Field, Formik } from "formik";
import * as Yup from "yup";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Stack, FormControl, Input, FormErrorMessage } from "@chakra-ui/react";
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

const nodeTypes = {
  tableNode: TableNode,
  stickyNote: StickyNoteNode,
  triggerNode: TriggerNode,
  walletNode: WalletNode,
  tokenNode: SendTokenNode,
  cronNode: CronNode,
  functionNode: FunctionNode,
};

export default function Flow({ params }: { params: { id: string } }) {
  const flowId = params.id;
  const { navigation } = useTable();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [flowName, setFlowName] = useState("");
  const [showNameModal, setShowNameModal] = useState(false);
  const [walletId, setWalletId] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), []);

  const { toastAlert } = useToastContext();

  useEffect(() => {
    getWorkflows();
  }, [navigation, flowId]);

  const getWorkflows = async () => {
    const result = await axiosInstance.get(`/table/gettablevalue/workflows/id/${flowId}`);
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
            type: "tableNode",
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
              userId: walletId,
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
              userId: walletId,
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
      const short_id = generateShortId();
      console.log(nodes);
      const trigger = nodes.filter((node) => node.type === "triggerNode");
      const cron = nodes.filter((node) => node.type === "cronNode");
      console.log(trigger);
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
    } catch (e) {
      toastAlert(false, "Something went wrong!");
    } finally {
      setShowNameModal(false);
      setSaveLoading(false);
    }
  };

  const createTriggerFlow = async (tableName: string, method: string, condition: string, short_id: string) => {
    const payload = {
      tableName: tableName,
      triggerName: short_id,
      method: method,
      condition: condition,
    };

    const response = await axiosInstance.post(`/table/addtrigger`, payload);

    if (response.status === 201) {
      return short_id;
    }
    return null;
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

      {showNameModal && (
        <Modal isOpen={showNameModal} onClose={() => setShowNameModal(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Enter Flow name</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Formik
                initialValues={{ newFlowName: "" }}
                validationSchema={Yup.object().shape({
                  newFlowName: Yup.string().required(),
                })}
                onSubmit={(values) => handleSave(values?.newFlowName)}
              >
                {({ handleSubmit, errors, touched }) => (
                  <form onSubmit={handleSubmit}>
                    <Stack spacing="8">
                      <Stack spacing="6">
                        <FormControl isInvalid={!!errors.newFlowName && touched.newFlowName}>
                          <Field as={Input} className="rounded-md" id="newFlowName" name="newFlowName" placeholder="Flow Name" />
                          {!isEmpty(errors?.newFlowName) && <FormErrorMessage>{errors?.newFlowName ? "Flow Name is required" : ""}</FormErrorMessage>}
                        </FormControl>
                        <button className="w-full p-2 text-white rounded-md bg-secondary hover:bg-secondaryHover" type="submit">
                          Save
                        </button>
                      </Stack>
                    </Stack>
                  </form>
                )}
              </Formik>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}
