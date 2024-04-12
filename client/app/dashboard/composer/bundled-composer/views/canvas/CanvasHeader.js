"use client";
import PropTypes from "prop-types";
import { useRouter, usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";

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

        if (typeof window !== undefined) {
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
    <div className="flex items-center justify-between p-4">
      <button onClick={goBack} className="rounded-full p-2">
        <IconChevronLeft stroke={1.5} size="28" />
      </button>

      {!isEditingWorkflowName && (
        <div className="flex items-center">
          {canvas.isDirty && <strong style={{ color: "orange" }}>*</strong>} {workflowName}
          {canvas.isDirty && <h1 className="text-xl font-semibold ml-2">{workflowName}</h1>}
          {workflow?.shortId && (
            <button onClick={() => setEditingWorkflowName(true)} className="p-2 ml-2">
              <IconPencil stroke={1.5} size="28" />
            </button>
          )}
          {workflow?.deployed && <span className="bg-green-100 text-green-800 border border-green-800 ml-1 px-2 py-1 rounded-full">Deployed</span>}
        </div>
      )}
      {isEditingWorkflowName && (
        <div className="flex items-center">
          <input ref={workflowNameRef} type="text" defaultValue={workflowName} className="input border-2 border-gray-200 p-1 rounded ml-2" />
          <button onClick={submitWorkflowName} className="p-2">
            <IconCheck stroke={1.5} size="28" />
          </button>
          <button onClick={() => setEditingWorkflowName(false)} className="p-2">
            <IconX stroke={1.5} size="28" />
          </button>
        </div>
      )}

      <div className="flex items-center">
        {workflow?.shortId && (
          <button ref={viewExecutionRef} onClick={() => setExecutionOpen(!isExecutionOpen)} className="rounded-full p-2 mr-2">
            <IconListCheck stroke={1.5} size="28" />
          </button>
        )}

        {workflow?.shortId && (
          <button onClick={workflow?.deployed ? handleStopWorkflow : handleDeployWorkflow} className="rounded-full p-2 mr-2">
            {workflow?.deployed ? <IconPlayerPause stroke={1.5} size="28" /> : <IconRocket stroke={1.5} size="28" />}
          </button>
        )}

        <button onClick={onSaveWorkflowClick} className="rounded-full p-2 mr-2">
          <IconDeviceFloppy stroke={1.5} size="28" />
        </button>

        <button ref={settingsRef} onClick={() => setSettingsOpen(!isSettingsOpen)} className="rounded-full p-2 mr-2">
          <IconSettings stroke={1.5} size="28" />
        </button>
      </div>
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
    </div>
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
