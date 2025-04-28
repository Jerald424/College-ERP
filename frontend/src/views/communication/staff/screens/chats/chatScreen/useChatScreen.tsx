import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import axiosInstance from "src/axiosInstance";
import { useAppDispatch, useBase } from "src/redux/hooks";
import { getMessages, removeMessage } from "../../../redux/slice/main";
import { useCommunicationMainSlice } from "../../../redux/store";
import { socket } from "../../..";

const postMessage = async ({ message }) => {
  const response = await axiosInstance.post("api/communication/message", {
    message,
  });
  return response;
};

export const deleteSingleMessage = async ({ id, query }) => {
  if (!id) return {};
  const response = await axiosInstance.delete(`api/communication/delete-message/${id}${query ?? ""}`);
  return response;
};

export default function useChatScreen() {
  const { mutate: postMessageMutate, isPending: isLoadingCreateMessage } = useMutation({ mutationKey: ["post/message"], mutationFn: postMessage });
  const { chats } = useCommunicationMainSlice();
  const dispatch = useAppDispatch();
  const [message, setMessage] = useState("");
  const ref = useRef();

  const postMessageFn = () => {
    let message_payload = {
      message,
    };
    if (chats?.selected_contact?.is_group) message_payload["group_id"] = chats?.selected_contact?.id;
    else message_payload["receiver_id"] = chats?.selected_contact?.id;
    postMessageMutate(
      { message: message_payload },
      {
        onSettled() {
          setMessage("");
        },
      }
    );
  };

  const fetchMes = () => {
    let obj = {
      id: chats?.selected_contact?.id,
      type: chats?.selected_contact?.["is_group"] ? "group" : "private",
    };
    dispatch(getMessages(obj)).then(() => {
      ref.current?.lastElementChild?.scrollIntoView({ behavior: "smooth" });
    });
  };

  useEffect(() => {
    if (chats?.selected_contact) fetchMes();
  }, [chats?.selected_contact]);

  return { postMessageFn, message, setMessage, isLoadingCreateMessage, ref };
}

export const useMessages = () => {
  const {
    chats: { message },
  } = useCommunicationMainSlice();
  const {
    user: { info },
  } = useBase();
  const dispatch = useAppDispatch();

  let messages = useMemo(() => {
    try {
      return message?.map((tmp) => {
        let res = { ...tmp };
        if (info?.user?.id == res?.sender_id) res["is_sent"] = true;
        return res;
      });
    } catch (error) {
      console.error(error);
    }
  }, [message, info]);
  useEffect(() => {
    socket.on("single_message_deleted", (data) => {
      dispatch(removeMessage(data));
    });
  }, [socket]);

  return { messages };
};
