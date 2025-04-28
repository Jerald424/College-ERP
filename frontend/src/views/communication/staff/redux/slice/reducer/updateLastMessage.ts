import { current } from "@reduxjs/toolkit";
import store from "src/redux";

export default function updateLastMessage({ state, payload }) {
  try {
    let user_index = payload?.group_id
      ? state?.chats_list?.response?.findIndex((res) => res?.id == payload?.group_id)
      : state?.chats_list?.response?.findIndex((res) => (payload?.is_sender ? res?.id == payload?.receiver_id : res?.id == payload?.sender_id));
    if (user_index !== -1) {
      let cur_state = JSON.parse(JSON.stringify(current(state)));
      cur_state.chats_list.response[user_index]["last_message"] = payload;

      state.chats_list.response?.splice(user_index, 1);
      state?.chats_list?.response?.splice(0, 0, cur_state?.chats_list.response[user_index]);
    } else {
      let user = {
        ...payload,
      };
      Object.assign(user, payload?.is_sender ? payload?.sender : payload?.receiver);
      Object.assign(user, { last_message: payload });
      state.chats_list.response?.unshift(user);
    }
  } catch (error) {
    console.error(error);
  }
}

export const updateGroupInfoOnState = ({ state, payload }) => {
  try {
    let group_index = state?.chats_list?.response?.findIndex((res) => res?.id == payload?.group?.id);
    if (group_index != -1) {
      let is_removed = payload?.removed_user?.includes(payload?.user_id);
      if (is_removed) state?.chats_list?.response?.splice(group_index, 1);
      Object.assign(state?.chats_list?.response?.[group_index], payload?.group);
    }
    if (state?.chats?.selected_contact?.is_group && state?.chats?.selected_contact?.id == payload?.group?.id) Object.assign(state?.chats?.selected_contact, payload?.group);
  } catch (error) {
    console.error(error);
  }
};
