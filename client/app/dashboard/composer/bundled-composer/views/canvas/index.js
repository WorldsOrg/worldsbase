"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import ReactFlow, { addEdge, Controls, useNodesState, useEdgesState } from "reactflow";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import "reactflow/dist/style.css";
import * as React from "react";

import { useDispatch, useSelector } from "react-redux";
import { REMOVE_DIRTY, SET_DIRTY, SET_WORKFLOW } from "../../store/actions";

// material-ui
import { Toolbar, Box, AppBar, Fab, CircularProgress } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Snackbar from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

// project imports
import CanvasNode from "./CanvasNode";
import CanvasHeader from "./CanvasHeader";
import AddNodes from "./AddNodes";
import EditNodes from "./EditNodes";
import ConfirmDialog from "../../ui-component/dialog/ConfirmDialog";
import TestWorkflowDialog from "../../ui-component/dialog/TestWorkflowDialog";

// API
import nodesApi from "../../api/nodes";
import workflowsApi from "../../api/workflows";
import webhooksApi from "../../api/webhooks";

// Hooks
import useApi from "../../hooks/useApi";
import useConfirm from "../../hooks/useConfirm";

// icons
import { IconX, IconBolt } from "@tabler/icons";

// third party
import socketIOClient from "socket.io-client";

// utils
import { generateWebhookEndpoint, getUniqueNodeId, checkIfNodeLabelUnique, addAnchors, getEdgeLabelName, checkMultipleTriggers } from "../../utils/genericHelper";

// const
import { baseURL } from "../../store/constant";

import "./index.css";

const nodeTypes = { customNode: CanvasNode };

// ==============================|| CANVAS ||============================== //

const Canvas = () => {
  const theme = useTheme();
  const params = useSearchParams();
  const router = useRouter();
  const currentPath = usePathname();

  const workflowShortId = params.get("id") || "";

  const { confirm } = useConfirm();

  const dispatch = useDispatch();
  const canvas = useSelector((state) => state.canvas);

  const [canvasDataStore, setCanvasDataStore] = useState(canvas);
  const [workflow, setWorkflow] = useState(null);
  const [isTestWorkflowDialogOpen, setTestWorkflowDialogOpen] = useState(false);
  const [testWorkflowDialogProps, setTestWorkflowDialogProps] = useState({});
  const [isTestingWorkflow, setIsTestingWorkflow] = useState(false);

  // ==============================|| Snackbar ||============================== //

  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // ==============================|| ReactFlow ||============================== //

  const [nodes, setNodes, onNodesChange] = useNodesState();
  const [edges, setEdges, onEdgesChange] = useEdgesState();

  const [rfInstance, setRfInstance] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  const reactFlowWrapper = useRef(null);

  // ==============================|| Workflow API ||============================== //

  const getNodesApi = useApi(nodesApi.getAllNodes);
  const removeTestTriggersApi = useApi(nodesApi.removeTestTriggers);
  const deleteAllTestWebhooksApi = useApi(webhooksApi.deleteAllTestWebhooks);
  const createNewWorkflowApi = useApi(workflowsApi.createNewWorkflow);
  const testWorkflowApi = useApi(workflowsApi.testWorkflow);
  const updateWorkflowApi = useApi(workflowsApi.updateWorkflow);
  const getSpecificWorkflowApi = useApi(workflowsApi.getSpecificWorkflow);

  // ==============================|| Events & Actions ||============================== //

  const onConnect = (params) => {
    const newEdge = {
      ...params,
      type: "smoothstep",
      id: `${params.source}-${params.sourceHandle}-${params.target}-${params.targetHandle}`,
      data: { label: getEdgeLabelName(params.sourceHandle) },
    };
    setEdges((eds) => addEdge(newEdge, eds));
    setDirty();
  };

  const goBack = () => {
    const workflowPathname = currentPath.replace("canvas", "");
    router.push(`${workflowPathname}`);
  };

  const handleTestWorkflow = () => {
    try {
      if (workflow.deployed) {
        alert("Testing workflow requires stopping deployed workflow. Please stop deployed workflow first");
        return;
      }
      const rfInstanceObject = rfInstance.toObject();
      const nodes = rfInstanceObject.nodes || [];
      setTestWorkflowDialogOpen(true);
      setTestWorkflowDialogProps({
        title: "Test Workflow",
        nodes: nodes.filter((nd) => !nd.id.includes("ifElse")),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const onStartingPointClick = (startingNodeId) => {
    try {
      const socket = socketIOClient(baseURL);
      const rfInstanceObject = rfInstance.toObject();
      const nodes = rfInstanceObject.nodes || [];
      const edges = rfInstanceObject.edges || [];
      setTestWorkflowDialogOpen(false);

      socket.on("connect", () => {
        const clientId = socket.id;
        const node = nodes.find((nd) => nd.id === startingNodeId);
        const nodeData = node.data;
        const body = {
          nodes,
          edges,
          clientId,
          nodeData,
        };
        testWorkflowApi.request(startingNodeId, body);
        setNodes((nds) =>
          nds.map((node) => {
            node.data = {
              ...node.data,
              outputResponses: {
                ...node.data.outputResponses,
                submit: null,
                needRetest: null,
              },
              selected: false,
            };
            return node;
          })
        );
        setIsTestingWorkflow(true);
      });

      socket.on("testWorkflowNodeResponse", (value) => {
        const { nodeId, data, status } = value;

        const node = nodes.find((nd) => nd.id === nodeId);
        if (node) {
          const outputValues = {
            submit: status === "FINISHED" ? true : null,
            needRetest: status === "FINISHED" ? null : true,
            output: data,
          };
          const nodeData = node.data;
          nodeData["outputResponses"] = outputValues;
          setNodes((nds) =>
            nds.map((node) => {
              if (node.id === nodeId) {
                node.data = {
                  ...nodeData,
                  selected: false,
                };
              }
              return node;
            })
          );
        }
      });

      socket.on("testWorkflowNodeFinish", () => {
        setIsTestingWorkflow(false);
        socket.disconnect();
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleLoadWorkflow = (file) => {
    try {
      const flowData = JSON.parse(file);
      const nodes = flowData.nodes || [];

      for (let i = 0; i < nodes.length; i += 1) {
        const nodeData = nodes[i].data;

        if (nodeData.type === "webhook") nodeData.webhookEndpoint = generateWebhookEndpoint(nodeData.icon);
      }

      setNodes(nodes);
      setEdges(flowData.edges || []);
      setDirty();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeployWorkflow = async () => {
    if (rfInstance) {
      const rfInstanceObject = rfInstance.toObject();
      const flowData = JSON.stringify(rfInstanceObject);

      try {
        // Always save workflow first
        let savedWorkflowResponse;
        if (!workflow.shortId) {
          const newWorkflowBody = {
            name: workflow.name,
            deployed: false,
            flowData,
          };
          const response = await workflowsApi.createNewWorkflow(newWorkflowBody);
          savedWorkflowResponse = response.data;
        } else {
          const updateBody = {
            flowData,
          };
          const response = await workflowsApi.updateWorkflow(workflow.shortId, updateBody);
          savedWorkflowResponse = response.data;
        }

        dispatch({ type: REMOVE_DIRTY });

        // Then deploy
        const response = await workflowsApi.deployWorkflow(savedWorkflowResponse.shortId);
        const deployedWorkflowResponse = response.data;
        dispatch({ type: SET_WORKFLOW, workflow: deployedWorkflowResponse });

        setSnackbarMessage("Workflow deployed");
        setOpenSnackbar(true);
      } catch (error) {
        const errorData = error.response.data || `${error.response.status}: ${error.response.statusText}`;
        setSnackbarMessage(errorData);
        setOpenSnackbar(true);
      }
    }
  };

  const handleStopWorkflow = async () => {
    try {
      const response = await workflowsApi.deployWorkflow(workflow.shortId, { halt: true });
      const stoppedWorkflowResponse = response.data;
      dispatch({ type: SET_WORKFLOW, workflow: stoppedWorkflowResponse });

      setSnackbarMessage("Workflow stopped");
      setOpenSnackbar(true);
    } catch (error) {
      const errorData = error.response.data || `${error.response.status}: ${error.response.statusText}`;
      setSnackbarMessage(errorData);
      setOpenSnackbar(true);
    }
  };

  const handleDeleteWorkflow = async () => {
    const confirmPayload = {
      title: `Delete`,
      description: `Delete workflow ${workflow.name}?`,
      confirmButtonName: "Delete",
      cancelButtonName: "Cancel",
    };
    const isConfirmed = await confirm(confirmPayload);

    if (isConfirmed) {
      try {
        await workflowsApi.deleteWorkflow(workflow.shortId);
        goBack();
      } catch (error) {
        const errorData = error.response.data || `${error.response.status}: ${error.response.statusText}`;
        setSnackbarMessage(errorData);
        setOpenSnackbar(true);
      }
    }
  };

  const handleSaveFlow = (workflowName) => {
    if (rfInstance) {
      setNodes((nds) =>
        nds.map((node) => {
          node.data = {
            ...node.data,
            selected: false,
          };
          return node;
        })
      );

      const rfInstanceObject = rfInstance.toObject();
      const flowData = JSON.stringify(rfInstanceObject);

      if (!workflow.shortId) {
        const newWorkflowBody = {
          name: workflowName,
          deployed: false,
          flowData,
        };
        createNewWorkflowApi.request(newWorkflowBody);
      } else {
        const updateBody = {
          name: workflowName,
          flowData,
        };
        updateWorkflowApi.request(workflow.shortId, updateBody);
      }
    }
  };

  // eslint-disable-next-line
  const onNodeDoubleClick = useCallback((event, clickedNode) => {
    setSelectedNode(clickedNode);
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === clickedNode.id) {
          node.data = {
            ...node.data,
            selected: true,
          };
        } else {
          node.data = {
            ...node.data,
            selected: false,
          };
        }

        return node;
      })
    );
  });

  const onNodeContextMenu = (event, clickedNode) => {
    event.preventDefault();
    setSelectedNode(clickedNode);
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === clickedNode.id) {
          node.data = {
            ...node.data,
            selected: true,
          };
        } else {
          node.data = {
            ...node.data,
            selected: false,
          };
        }
        return node;
      })
    );
  };

  // eslint-disable-next-line
  const onNodeLabelUpdate = useCallback((nodeLabel) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          if (!checkIfNodeLabelUnique(nodeLabel, rfInstance.getNodes())) {
            setSnackbarMessage("Duplicated node label");
            setOpenSnackbar(true);
          } else {
            if (node.data.label !== nodeLabel) {
              setTimeout(() => setDirty(), 0);
            }
            node.data = {
              ...node.data,
              label: nodeLabel,
            };
          }
        }
        return node;
      })
    );
  });

  // eslint-disable-next-line
  const onNodeValuesUpdate = useCallback((nodeFlowData) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          setTimeout(() => setDirty(), 0);
          node.data = {
            ...node.data,
            ...nodeFlowData,
            selected: true,
          };
        }
        return node;
      })
    );
  });

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      let nodeData = event.dataTransfer.getData("application/reactflow");

      // check if the dropped element is valid
      if (typeof nodeData === "undefined" || !nodeData) {
        return;
      }

      nodeData = JSON.parse(nodeData);

      // check if workflow contains multiple triggers/webhooks
      if ((nodeData.type === "webhook" || nodeData.type === "trigger") && checkMultipleTriggers(rfInstance.getNodes())) {
        setSnackbarMessage("Workflow can only contain 1 trigger or webhook node");
        setOpenSnackbar(true);
        return;
      }

      if (nodeData.type === "webhook") nodeData.webhookEndpoint = generateWebhookEndpoint(nodeData.icon);

      const position = rfInstance.project({
        x: event.clientX - reactFlowBounds.left - 100,
        y: event.clientY - reactFlowBounds.top - 50,
      });

      const newNodeId = getUniqueNodeId(nodeData, rfInstance.getNodes());

      const newNode = {
        id: newNodeId,
        position,
        type: "customNode",
        data: addAnchors(nodeData, rfInstance.getNodes(), newNodeId),
      };

      setSelectedNode(newNode);
      setNodes((nds) =>
        nds.concat(newNode).map((node) => {
          if (node.id === newNode.id) {
            node.data = {
              ...node.data,
              selected: true,
            };
          } else {
            node.data = {
              ...node.data,
              selected: false,
            };
          }

          return node;
        })
      );
      setTimeout(() => setDirty(), 0);
    },

    // eslint-disable-next-line
    [rfInstance]
  );

  const saveWorkflowSuccess = () => {
    dispatch({ type: REMOVE_DIRTY });
    setSnackbarMessage("Workflow Saved");
    setOpenSnackbar(true);
  };

  const errorFailed = (message) => {
    setSnackbarMessage(message);
    setOpenSnackbar(true);
  };

  const setDirty = () => {
    dispatch({ type: SET_DIRTY });
  };

  // ==============================|| useEffect ||============================== //

  // Get specific workflow successful
  useEffect(() => {
    if (getSpecificWorkflowApi.data) {
      const workflow = getSpecificWorkflowApi.data;
      const initialFlow = workflow.flowData ? JSON.parse(workflow.flowData) : [];
      setNodes(initialFlow.nodes || []);
      setEdges(initialFlow.edges || []);
      dispatch({ type: SET_WORKFLOW, workflow });
    } else if (getSpecificWorkflowApi.error) {
      const error = getSpecificWorkflowApi.error;
      console.log(error);
      const errorData = error.response.data || `${error.response.status}: ${error.response.statusText}`;
      errorFailed(`Failed to retrieve workflow: ${errorData}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getSpecificWorkflowApi.data, getSpecificWorkflowApi.error]);

  // Create new workflow successful
  useEffect(() => {
    if (createNewWorkflowApi.data) {
      const workflow = createNewWorkflowApi.data;
      dispatch({ type: SET_WORKFLOW, workflow });
      saveWorkflowSuccess();
      window.history.replaceState(null, null, `/canvas/${workflow.shortId}`);
    } else if (createNewWorkflowApi.error) {
      const error = createNewWorkflowApi.error;
      const errorData = error.response.data || `${error.response.status}: ${error.response.statusText}`;
      errorFailed(`Failed to save workflow: ${errorData}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createNewWorkflowApi.data, createNewWorkflowApi.error]);

  // Update workflow successful
  useEffect(() => {
    if (updateWorkflowApi.data) {
      dispatch({ type: SET_WORKFLOW, workflow: updateWorkflowApi.data });
      saveWorkflowSuccess();
    } else if (updateWorkflowApi.error) {
      const error = updateWorkflowApi.error;
      const errorData = error.response.data || `${error.response.status}: ${error.response.statusText}`;
      errorFailed(`Failed to save workflow: ${errorData}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateWorkflowApi.data, updateWorkflowApi.error]);

  // Test workflow failed
  useEffect(() => {
    if (testWorkflowApi.error) {
      setSnackbarMessage("Test workflow failed");
      setOpenSnackbar(true);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testWorkflowApi.error]);

  // Listen to edge button click remove redux event
  useEffect(() => {
    if (rfInstance) {
      const edges = rfInstance.getEdges();
      const toRemoveEdgeId = canvasDataStore.removeEdgeId.split(":")[0];
      setEdges(edges.filter((edge) => edge.id !== toRemoveEdgeId));
      setDirty();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasDataStore.removeEdgeId]);

  useEffect(() => setWorkflow(canvasDataStore.workflow), [canvasDataStore.workflow]);

  // Initialization
  useEffect(() => {
    removeTestTriggersApi.request();
    deleteAllTestWebhooksApi.request();

    if (workflowShortId) {
      getSpecificWorkflowApi.request(workflowShortId);
    } else {
      setNodes([]);
      setEdges([]);
      dispatch({
        type: SET_WORKFLOW,
        workflow: {
          name: "Untitled workflow",
        },
      });
    }

    getNodesApi.request();

    // Clear dirty state before leaving and remove any ongoing test triggers and webhooks
    return () => {
      removeTestTriggersApi.request();
      deleteAllTestWebhooksApi.request();

      setTimeout(() => dispatch({ type: REMOVE_DIRTY }), 0);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setCanvasDataStore(canvas);
  }, [canvas]);

  useEffect(() => {
    function handlePaste(e) {
      const pasteData = e.clipboardData.getData("text");
      //TODO: prevent paste event when input focused, temporary fix: catch workflow syntax
      if (pasteData.includes('{"nodes":[') && pasteData.includes('],"edges":[')) {
        handleLoadWorkflow(pasteData);
      }
    }

    window.addEventListener("paste", handlePaste);

    return () => {
      window.removeEventListener("paste", handlePaste);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //usePrompt("You have unsaved changes! Do you want to navigate away?", canvasDataStore.isDirty);

  const [trigger, setTrigger] = useState(0);

  const onConnectEnd = useCallback((event) => {
    const targetIsPane = event.target.classList.contains("react-flow__pane");

    if (targetIsPane) {
      setTrigger(() => trigger + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const proOptions = { hideAttribution: true };

  const handleClick = () => {
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSnackbar(false);
    setSnackbarMessage("");
  };

  const snackbarAction = (
    <React.Fragment>
      <IconButton size="small" aria-label="close" color="inherit" onClick={handleCloseSnackbar}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  return (
    <>
      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={handleCloseSnackbar} message={snackbarMessage} action={snackbarAction} />
      <Box className="react-flow-page">
        <AppBar
          enableColorOnDark
          position="relative"
          color="inherit"
          elevation={1}
          sx={{
            bgcolor: theme.palette.background.default,
          }}
        >
          <Toolbar>
            <CanvasHeader
              workflow={workflow}
              handleSaveFlow={handleSaveFlow}
              handleDeployWorkflow={handleDeployWorkflow}
              handleStopWorkflow={handleStopWorkflow}
              handleDeleteWorkflow={handleDeleteWorkflow}
              handleLoadWorkflow={handleLoadWorkflow}
            />
          </Toolbar>
        </AppBar>
        <Box sx={{ height: "100%", width: "100%" }}>
          <div className="reactflow-parent-wrapper">
            <div className="reactflow-wrapper" ref={reactFlowWrapper} style={{ backgroundColor: "#202735" }}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onNodeDoubleClick={onNodeDoubleClick}
                onNodeContextMenu={onNodeContextMenu}
                onEdgesChange={onEdgesChange}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onNodeDragStop={setDirty}
                nodeTypes={nodeTypes}
                edgeTypes={"smoothstep"}
                onConnect={onConnect}
                onInit={setRfInstance}
                fitView
                proOptions={proOptions}
                onConnectEnd={onConnectEnd}
                style={{
                  background: "linear-gradient(60deg, rgba(201, 201, 201, 0.277) 0%, #f7f7f7ad 100%)",
                }}
              >
                <Controls
                  showInteractive={false}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    left: "5%",
                    transform: "translate(-50%, -50%)",
                    color: "red",
                  }}
                />
                <AddNodes nodesData={getNodesApi.data} node={selectedNode} trigger={trigger} />
                <EditNodes nodes={nodes} edges={edges} node={selectedNode} workflow={workflow} onNodeLabelUpdate={onNodeLabelUpdate} onNodeValuesUpdate={onNodeValuesUpdate} />
                <Fab
                  className="bg-black"
                  sx={{ color: "white", position: "absolute", right: 20, top: 30 }}
                  size="small"
                  color="warning"
                  aria-label="test"
                  title="Test Workflow"
                  disabled={isTestingWorkflow}
                  onClick={handleTestWorkflow}
                >
                  {<IconBolt />}
                </Fab>
                {isTestingWorkflow && (
                  <CircularProgress
                    size={50}
                    sx={{
                      color: theme.palette.warning.dark,
                      position: "absolute",
                      right: 20,
                      top: 100,
                    }}
                  />
                )}
              </ReactFlow>
            </div>
          </div>
        </Box>
        <ConfirmDialog />
        <TestWorkflowDialog
          show={isTestWorkflowDialogOpen}
          dialogProps={testWorkflowDialogProps}
          onCancel={() => setTestWorkflowDialogOpen(false)}
          onItemClick={onStartingPointClick}
        />
      </Box>
    </>
  );
};

export default Canvas;
