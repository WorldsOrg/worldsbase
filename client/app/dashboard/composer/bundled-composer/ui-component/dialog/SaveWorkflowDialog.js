"use client";
import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";

import { Button, Dialog, DialogActions, DialogContent, OutlinedInput, DialogTitle } from "@mui/material";
import { StyledButton } from "../StyledButton";

const SaveWorkflowDialog = ({ show, dialogProps, onCancel, onConfirm }) => {
  const portalElement = typeof window !== undefined ? window.document.getElementById('portal') : undefined;

  const [workflowName, setWorkflowName] = useState("");
  const [isReadyToSave, setIsReadyToSave] = useState(false);

  useEffect(() => {
    if (workflowName) setIsReadyToSave(true);
    else setIsReadyToSave(false);
  }, [workflowName]);

  const component = show ? (
    <Dialog open={show} fullWidth maxWidth="xs" onClose={onCancel} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
      <DialogTitle sx={{ fontSize: "1rem" }} id="alert-dialog-title">
        {dialogProps.title}
      </DialogTitle>
      <DialogContent>
        <OutlinedInput
          sx={{ mt: 1 }}
          id="workflow-name"
          type="text"
          fullWidth
          placeholder="My New Workflow"
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{dialogProps.cancelButtonName}</Button>
        <StyledButton disabled={!isReadyToSave} variant="contained" onClick={() => onConfirm(workflowName)}>
          {dialogProps.confirmButtonName}
        </StyledButton>
      </DialogActions>
    </Dialog>
  ) : null;

  if (!portalElement) return null; // Render nothing if the portal element isn't ready

  return createPortal(component, portalElement);
};

SaveWorkflowDialog.propTypes = {
  show: PropTypes.bool,
  dialogProps: PropTypes.object,
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func,
};

export default SaveWorkflowDialog;
