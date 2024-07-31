// hooks/useWorkflow.ts
import { useState, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useNodesState, useEdgesState } from "reactflow";

export const useWorkflow = (flowId: string) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [flowName, setFlowName] = useState("");
  const [flowFound, setFlowFound] = useState(false);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const fetchWorkflow = async () => {
      const result = await axiosInstance.get(`/table/gettablevalue/workflows/id/${flowId}`);
      if (result.data[0]) {
        setNodes(result.data[0].nodes);
        setEdges(result.data[0].edges);
        setFlowName(result.data[0].name);
        setFlowFound(true);
        setLocked(result.data[0].locked);
      }
    };
    fetchWorkflow();
  }, [flowId, setNodes, setEdges]);

  return { nodes, setNodes, onNodesChange, edges, setEdges, onEdgesChange, flowName, setFlowName, flowFound, locked, setLocked };
};
