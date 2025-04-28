import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "src/axiosInstance";
import updateLastMessage, { updateGroupInfoOnState } from "./reducer/updateLastMessage";

export const getMessages = createAsyncThunk("get/message", async ({ type, id }: { type: string; id: number }) => {
  if ([type, id].some((res) => !res)) return {};
  const response = await axiosInstance.get(`api/communication/message/${type}/${id}`);
  return response;
});

export const getChatList = createAsyncThunk("get/chat-list", async () => {
  const response = await axiosInstance.get("api/communication/my-groups-chats");
  return response;
});

export const getContactInfo = createAsyncThunk("get/contact-info", async ({ user_id }) => {
  const response = await axiosInstance.get(`api/communication/contact-info/${user_id}`);
  return response;
});

export const deleteMessage = createAsyncThunk("delete/message", async ({ user_id }, { dispatch }) => {
  if (!user_id) return {};
  const response = axiosInstance.delete(`api/communication/delete-chat/${user_id}`);
  dispatch(addEditCom({ key: "message", obj: "chats", value: [] }));
  return response;
});

export const blockUnBlockUser = createAsyncThunk("block/un-block-user", async ({ user_id, type }, { dispatch }) => {
  const response = await axiosInstance.post(`api/communication/block-unblock/${type}/${user_id}`);
  dispatch(getContactInfo({ user_id }));
  return response;
});

const communication_main_slice = createSlice({
  name: "communication_main",
  initialState: {
    chats: {
      selected_contact: null,
      message: [],
      is_message_loading: false,
      selected_contact_info: null,
    },
    chats_list: null,
  },
  reducers: {
    addEditCom: (state, { payload }: { payload: { obj: string; key: string; value: any } }) => {
      state[payload.obj][payload.key] = payload.value;
    },
    addMessage: (state, { payload }) => {
      state.chats.message.push(payload);
    },
    updateLastMessageReducer: (state, { payload }) => {
      updateLastMessage({ state, payload });
    },
    updateGroupOnState: (state, { payload }) => updateGroupInfoOnState({ state, payload }),
    removeMessage: (state, { payload }) => {
      let index = state.chats.message.findIndex((res) => res?.id == payload?.id);
      if (index != -1) state.chats.message.splice(index, 1);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMessages.pending, (state) => {
        state.chats.message = [];
        state.chats.is_message_loading = true;
      })
      .addCase(getMessages.fulfilled, (state, { payload }) => {
        state.chats.message = payload?.response?.reverse();
        state.chats.is_message_loading = false;
      })
      .addCase(getMessages.rejected, (state) => {
        state.chats.is_message_loading = false;
      })
      .addCase(getChatList.fulfilled, (state, { payload }) => {
        state.chats_list = payload;
      })
      .addCase(getContactInfo.pending, (state) => {
        state.chats.selected_contact_info = null;
      })
      .addCase(getContactInfo.fulfilled, (state, { payload }) => {
        state.chats.selected_contact_info = payload?.response;
      });
  },
});

export const { addEditCom, addMessage, updateLastMessageReducer, updateGroupOnState, removeMessage } = communication_main_slice.actions;
export default communication_main_slice.reducer;
