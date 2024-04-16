// store/reducers/userReducer.js
// action - state management
import * as actionTypes from "../actions";

export const initialState = {
  usermail: null,
  project: null,
};

// ==============================|| CANVAS REDUCER ||============================== //

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.ADD_USER:
      return {
        ...state,
        usermail: action.usermail,
        project: action.project,
      };
    case actionTypes.REMOVE_USER:
      return {
        ...state,
        usermail: null,
        project: null,
      };
    default:
      return state;
  }
};

export default userReducer;
