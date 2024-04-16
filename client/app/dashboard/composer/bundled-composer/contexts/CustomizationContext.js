// contexts/CustomizationContext.js
import React, { createContext, useReducer } from "react";
import customizationReducer, { initialState } from "../store/reducers/customizationReducer";

const CustomizationContext = createContext();

export const CustomizationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(customizationReducer, initialState);

  return <CustomizationContext.Provider value={[state, dispatch]}>{children}</CustomizationContext.Provider>;
};

export default CustomizationContext;
