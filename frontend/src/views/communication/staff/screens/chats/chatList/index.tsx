import { FlatList, InputBox, ModalLoader, Para } from "src/components/styled";
import { useAppDispatch, useColors } from "src/redux/hooks";
import { addEditCom, getContactInfo } from "../../../redux/slice/main";
import { useCommunicationMainSlice } from "../../../redux/store";
import useChatList from "./useChatList";
import { useMemo } from "react";
import avatar from "src/assets/color_icon/man.png";

export default function Chat() {
  const { groupsChat, isLoadingGroupChat } = useChatList();

  if (isLoadingGroupChat)
    return (
      <div className="my-3 text-center">
        <ModalLoader />
      </div>
    );
  return (
    <div>
      <div className="px-2">
        <InputBox placeholder="Search" />
      </div>
      <div className="mt-3" />
      <FlatList data={groupsChat?.response} renderItem={(item) => <SepGroupChat item={item} key={`${item?.is_group ? "group" : "private"}_${item?.id}`} />} />
    </div>
  );
}

export const SepGroupChat = ({ item }) => {
  const { colorBgLayout } = useColors();
  const dispatch = useAppDispatch();
  const { chats } = useCommunicationMainSlice();

  let image_name = useMemo(() => {
    if (item?.is_group) return { image: item?.image, name: item?.name };
    else if (item?.student_id) return { image: item?.student?.applicant?.image, name: item?.student?.applicant?.name };
    else return { image: item?.staff?.image, name: item?.staff?.name };
  }, [item]);

  const handleSelectContact = () => {
    dispatch(addEditCom({ key: "selected_contact", obj: "chats", value: item }));
    dispatch(item?.is_group ? addEditCom({ key: "selected_contact_info", obj: "chats", value: null }) : getContactInfo({ user_id: item?.id }));
  };

  return (
    <div onClick={handleSelectContact} style={{ ...(chats?.selected_contact?.id == item?.id && { backgroundColor: colorBgLayout }) }} className="dajc cp  p-2 ">
      <img src={image_name?.image ?? avatar} style={{ height: 50, width: 50, borderRadius: 50, objectFit: "cover" }} />
      <div className="f1 ms-3">
        <Para>{image_name?.name}</Para>
        <small>{item?.last_message?.message ?? ""}</small>
      </div>
    </div>
  );
};
