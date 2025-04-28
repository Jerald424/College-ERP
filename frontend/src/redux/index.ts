import { configureStore } from "@reduxjs/toolkit";
import baseSlice from "./reducers/base/reducer";
import communicationReducer from "./combineReducer/communication";

const store = configureStore({
  reducer: {
    baseSlice,
    communication: communicationReducer,
  },
});

export type rootState = ReturnType<typeof store.getState>;
export type appDispatch = typeof store.dispatch;
export default store;
