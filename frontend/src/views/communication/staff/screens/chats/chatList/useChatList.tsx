import { isEmpty } from "lodash";
import { useEffect, useState } from "react";
import { useAppDispatch } from "src/redux/hooks";
import { socket } from "../../..";
import { addEditCom, getChatList } from "../../../redux/slice/main";
import { useCommunicationMainSlice } from "../../../redux/store";

export default function useChatList() {
  const { chats_list: groupsChat } = useCommunicationMainSlice();
  const [isLoadingGroupChat, setIsLoadingGroupChat] = useState(false);
  const dispatch = useAppDispatch();

  const joinGroup = () => {
    try {
      let group_ids = groupsChat?.response?.filter((res) => res?.is_group)?.map((res) => res?.id);
      socket.emit("join_group", { group_ids });
    } catch (error) {
      console.error(error);
    }
  };

  const refetch = () => {
    setIsLoadingGroupChat(true);
    dispatch(getChatList()).then((_) => {
      setIsLoadingGroupChat(false);
    });
  };

  useEffect(() => {
    socket.on("group_created", refetch);
    socket.on("group_deleted", () => {
      refetch();
      dispatch(addEditCom({ key: "selected_contact", obj: "chats", value: null }));
    });
  }, [socket]);

  useEffect(() => {
    if (!isEmpty(groupsChat)) joinGroup();
  }, [groupsChat]);

  useEffect(() => {
    refetch();
  }, []);
  return { groupsChat, isLoadingGroupChat };
}
