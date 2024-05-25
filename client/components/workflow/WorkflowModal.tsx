// components/WorkflowModal.js
import React from "react";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, FormControl, Input, FormErrorMessage } from "@chakra-ui/react";
import { Formik, Field } from "formik";
import * as Yup from "yup";

const WorkflowModal = ({ isOpen, onClose, onSave }: { isOpen: boolean; onClose: () => void; onSave: (value: string) => void }) => (
  <Modal isOpen={isOpen} onClose={onClose}>
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
          onSubmit={(values) => onSave(values?.newFlowName)}
        >
          {({ handleSubmit, errors, touched }) => (
            <form onSubmit={handleSubmit}>
              <FormControl isInvalid={!!errors.newFlowName && touched.newFlowName}>
                <Field as={Input} id="newFlowName" name="newFlowName" placeholder="Flow Name" />
                <FormErrorMessage>{errors.newFlowName}</FormErrorMessage>
              </FormControl>
              <button type="submit">Save</button>
            </form>
          )}
        </Formik>
      </ModalBody>
    </ModalContent>
  </Modal>
);

export default WorkflowModal;
