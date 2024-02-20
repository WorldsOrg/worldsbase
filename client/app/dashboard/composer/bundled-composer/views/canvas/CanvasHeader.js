"use client";
import PropTypes from "prop-types";
import { useRouter, usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";

// material-ui
import { useTheme } from "@mui/material/styles";
import { Box, ButtonBase, Typography, Stack, TextField, Chip } from "@mui/material";

// icons
import { IconSettings, IconChevronLeft, IconDeviceFloppy, IconRocket, IconPencil, IconCheck, IconX, IconPlayerPause, IconListCheck } from "@tabler/icons";

// project imports
import Executions from "../executions";
import Settings from "../settings";
import SaveWorkflowDialog from "../../ui-component/dialog/SaveWorkflowDialog";

// API
import workflowsApi from "../../api/workflows";

// Hooks
import useApi from "../../hooks/useApi";

// utils
import { generateExportFlowData } from "../../utils/genericHelper";

// ==============================|| CANVAS HEADER ||============================== //

const CanvasHeader = ({ workflow, handleSaveFlow, handleDeployWorkflow, handleStopWorkflow, handleDeleteWorkflow, handleLoadWorkflow }) => {
  const theme = useTheme();
  const workflowNameRef = useRef();
  const viewExecutionRef = useRef();
  const settingsRef = useRef();
  const router = useRouter();
  const currentPath = usePathname();

  const [isEditingWorkflowName, setEditingWorkflowName] = useState(null);
  const [workflowName, setWorkflowName] = useState("");
  const [isExecutionOpen, setExecutionOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [workfowDialogOpen, setWorkfowDialogOpen] = useState(false);

  const updateWorkflowApi = useApi(workflowsApi.updateWorkflow);
  const canvas = useSelector((state) => state.canvas);

  const onSettingsItemClick = (setting) => {
    setSettingsOpen(false);

    if (setting === "deleteWorkflow") {
      handleDeleteWorkflow();
    } else if (setting === "exportWorkflow") {
      try {
        const flowData = JSON.parse(workflow.flowData);
        let dataStr = JSON.stringify(generateExportFlowData(flowData));
        let dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

        let exportFileDefaultName = `${workflow.name} Workflow.json`;

        if(typeof window !== undefined) {
          let linkElement = window.document.createElement("a");
          linkElement.setAttribute("href", dataUri);
          linkElement.setAttribute("download", exportFileDefaultName);
          linkElement.click();
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const onUploadFile = (file) => {
    setSettingsOpen(false);
    handleLoadWorkflow(file);
  };

  const submitWorkflowName = () => {
    if (workflow.shortId) {
      const updateBody = {
        name: workflowNameRef.current.value,
      };
      updateWorkflowApi.request(workflow.shortId, updateBody);
    }
  };

  const onSaveWorkflowClick = () => {
    if (workflow.shortId) {
      const result = handleSaveFlow(workflow.name);
    } else setWorkfowDialogOpen(true);
  };

  const onConfirmSaveName = (workflowName) => {
    setWorkfowDialogOpen(false);
    handleSaveFlow(workflowName);
  };

  useEffect(() => {
    if (updateWorkflowApi.data) {
      setWorkflowName(updateWorkflowApi.data.name);
    }
    setEditingWorkflowName(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateWorkflowApi.data]);

  useEffect(() => {
    if (workflow) {
      setWorkflowName(workflow.name);
    }
  }, [workflow]);

  const goBack = () => {
    const workflowPathname = currentPath.replace("canvas", "");
    router.push(`${workflowPathname}`);
  };

  return (
    <>
      <Box>
        <ButtonBase title="Back" sx={{ borderRadius: "50%" }}>
          <IconChevronLeft stroke={1.5} size="28px" onClick={() => goBack()} />
        </ButtonBase>
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        {!isEditingWorkflowName && (
          <Stack flexDirection="row">
            <Typography
              sx={{
                fontSize: "1.5rem",
                fontWeight: 500,
                ml: 2,
              }}
            >
              {canvas.isDirty && <strong style={{ color: "orange" }}>*</strong>} {workflowName}
            </Typography>
            {workflow?.shortId && (
              <ButtonBase title="Edit Name" sx={{ borderRadius: "50%", mr: 2, ml: 2 }}>
                <IconPencil stroke={1.5} size="28px" onClick={() => setEditingWorkflowName(true)} />
              </ButtonBase>
            )}
            {workflow?.deployed && (
              <Chip
                sx={{
                  color: theme.palette.success.dark,
                  borderStyle: "solid",

                  backgroundColor: "rgba(72, 187, 120, 0.25)",
                  ml: 1,
                }}
                label="Deployed"
                color="success"
                variant="outlined"
              />
            )}
          </Stack>
        )}
        {isEditingWorkflowName && (
          <Stack flexDirection="row">
            <TextField
              size="small"
              inputRef={workflowNameRef}
              sx={{
                width: "50%",
                ml: 2,
              }}
              defaultValue={workflowName}
            />
            <ButtonBase title="Save Name" sx={{ borderRadius: "50%" }}>
              <IconCheck stroke={1.5} size="28px" onClick={submitWorkflowName} />
            </ButtonBase>
            <ButtonBase title="Cancel" sx={{ borderRadius: "50%" }}>
              <IconX stroke={1.5} size="28px" onClick={() => setEditingWorkflowName(false)} />
            </ButtonBase>
          </Stack>
        )}
      </Box>
      <Box>
        {workflow?.shortId && (
          <ButtonBase ref={viewExecutionRef} title="View Executions" sx={{ borderRadius: "50%", mr: 2 }}>
            <h6>{workflow?.executionCount}</h6>&nbsp;
            <IconListCheck stroke={1.5} size="28px" onClick={() => setExecutionOpen(!isExecutionOpen)} />
          </ButtonBase>
        )}
        {workflow?.shortId && (
          <ButtonBase title={workflow?.deployed ? "Stop Workflow" : "Deploy Workflow"} sx={{ borderRadius: "50%", mr: 2 }}>
            {workflow?.deployed ? (
              <IconPlayerPause stroke={1.5} size="28px" onClick={handleStopWorkflow} />
            ) : (
              <IconRocket stroke={1.5} size="28px" onClick={handleDeployWorkflow} />
            )}
          </ButtonBase>
        )}

        <ButtonBase title="Save Workflow" sx={{ mr: 2 }}>
          <IconDeviceFloppy stroke={1.5} size="28px" onClick={onSaveWorkflowClick} />
        </ButtonBase>
        <ButtonBase ref={settingsRef} title="Settings" sx={{ mr: 2 }}>
          <IconSettings stroke={1.5} size="28px" onClick={() => setSettingsOpen(!isSettingsOpen)} />
        </ButtonBase>
      </Box>
      {workflow?.shortId && (
        <Executions
          workflowShortId={workflow?.shortId}
          execution={workflow?.execution}
          executionCount={workflow?.executionCount}
          isExecutionOpen={isExecutionOpen}
          anchorEl={viewExecutionRef.current}
        />
      )}
      <Settings workflow={workflow} isSettingsOpen={isSettingsOpen} anchorEl={settingsRef.current} onSettingsItemClick={onSettingsItemClick} onUploadFile={onUploadFile} />
      <SaveWorkflowDialog
        show={workfowDialogOpen}
        dialogProps={{
          title: `Save New Workflow`,
          confirmButtonName: "Save",
          cancelButtonName: "Cancel",
        }}
        onCancel={() => setWorkfowDialogOpen(false)}
        onConfirm={onConfirmSaveName}
      />
    </>
  );
};

CanvasHeader.propTypes = {
  workflow: PropTypes.object,
  handleSaveFlow: PropTypes.func,
  handleDeployWorkflow: PropTypes.func,
  handleStopWorkflow: PropTypes.func,
  handleDeleteWorkflow: PropTypes.func,
  handleLoadWorkflow: PropTypes.func,
};

export default CanvasHeader;
