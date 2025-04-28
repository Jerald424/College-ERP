import { useEffect } from "react";
import { useAppDispatch, useBase } from "src/redux/hooks";
import { socket } from ".";
import { addEditCom, addMessage, updateGroupOnState, updateLastMessageReducer } from "./redux/slice/main";
import { useCommunicationMainSlice } from "./redux/store";

export default function useCommunicationIndex() {
  const dispatch = useAppDispatch();
  const {
    user: { info },
  } = useBase();
  const {
    chats: { selected_contact },
  } = useCommunicationMainSlice();

  useEffect(() => {
    socket.emit("join_user", { user_id: info?.user?.id });
  }, [info]);

  useEffect(() => {
    return () => {
      socket.emit("leave", { user_id: info?.user?.id });
    };
  }, []);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      console.log("data: MESSAGE RECEIVED ###", data);
      data["is_sender"] = data?.sender_id == info?.user?.id;
      dispatch(updateLastMessageReducer(data));
      dispatch(addMessage(data));
    });
    socket.on("group_updated", (data) => {
      console.log("GROUP UPDATED ###### ", data);
      data["user_id"] = info?.user?.id;

      dispatch(updateGroupOnState(data));
    });

    socket.on("message_deleted", (data) => {
      console.log("data: ", data);
      if (selected_contact?.id == data?.from) dispatch(addEditCom({ key: "selected_contact", obj: "chats", value: [] }));
    });
  }, [socket]);
}
