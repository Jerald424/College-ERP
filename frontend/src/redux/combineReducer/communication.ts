import { combineReducers } from "@reduxjs/toolkit";
import communication_main from "src/views/communication/staff/redux/slice/main";

const communicationReducer = combineReducers({
  communication_main,
});

export default communicationReducer;
