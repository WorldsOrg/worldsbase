"use client";
import { createPortal } from "react-dom";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import useConfirm from "../../hooks/useConfirm";
import { StyledButton } from "../StyledButton";

const ConfirmDialog = () => {
  const { onConfirm, onCancel, confirmState } = useConfirm();
  const portalElement = typeof window !== undefined ? window.document.getElementById('portal') : undefined;

  const component = confirmState.show ? (
    <Dialog fullWidth maxWidth="xs" open={confirmState.show} onClose={onCancel} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
      <DialogTitle sx={{ fontSize: "1rem" }} id="alert-dialog-title">
        {confirmState.title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: "black" }} id="alert-dialog-description">
          {confirmState.description}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{confirmState.cancelButtonName}</Button>
        <StyledButton className="bg-black" variant="contained" onClick={onConfirm}>
          {confirmState.confirmButtonName}
        </StyledButton>
      </DialogActions>
    </Dialog>
  ) : null;

  if (!portalElement) return null;
  return createPortal(component, portalElement);
};

export default ConfirmDialog;
