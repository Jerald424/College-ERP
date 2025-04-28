import { Dropdown, Popover, Result } from "antd";
import { memo, useMemo, useRef, useState } from "react";
import avatar from "src/assets/color_icon/man.png";
import { ButtonCmp, FlatList, Icon, InputBox, LoaderCmp, LoaderWithChildren, ModalLoader, Para, SubHeading } from "src/components/styled";
import { makeHHMMFromJSDate } from "src/functions/handleDate";
import { useColors } from "src/redux/hooks";
import { useCommunicationMainSlice } from "../../../redux/store";
import useChatScreen, { deleteSingleMessage, useMessages } from "./useChatScreen";
import SelectedContactInfo from "./info";
import { useMutation } from "@tanstack/react-query";

export default function ChatScreen() {
  const { chats } = useCommunicationMainSlice();
  const { postMessageFn, message, setMessage, isLoadingCreateMessage, ref } = useChatScreen();

  if (!chats?.selected_contact) return <Result title="Select contact to chat" />;
  return (
    <div className="h-100 d-flex flex-column reduce_scrollbar_width">
      <Header />
      <div className="f1 overflow-y-auto position-relative">
        {chats?.is_message_loading && <ModalLoader />}
        <Messages reactRef={ref} />
        <ScrollToBottom reactRef={ref} />
      </div>
      <Footer isLoadingPost={isLoadingCreateMessage} message={message} setMessage={setMessage} postMessageFn={postMessageFn} />
    </div>
  );
}

const Header = () => {
  const { colorPrimaryBgHover } = useColors();
  const {
    chats: { selected_contact },
  } = useCommunicationMainSlice();

  let image_name = useMemo(() => {
    if (selected_contact?.is_group) return { image: selected_contact?.image, name: selected_contact?.name };
    else if (selected_contact?.student_id) return { image: selected_contact?.student?.applicant?.image, name: selected_contact?.student?.applicant?.name };
    else return { image: selected_contact?.staff?.image, name: selected_contact?.staff?.name };
  }, [selected_contact]);

  return (
    <div style={{ backgroundColor: colorPrimaryBgHover }} className="dajc  p-2">
      <div className="dajc f1">
        <img src={image_name?.image ?? avatar} style={{ height: 50, width: 50, borderRadius: 50, objectFit: "cover" }} /> &nbsp;&nbsp;
        <SubHeading className="mb-0">{image_name?.name}</SubHeading>
      </div>
      <HeaderMoreInfo />
    </div>
  );
};

const HeaderMoreInfo = () => {
  const {
    chats: { selected_contact },
  } = useCommunicationMainSlice();
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);

  let items = [
    {
      key: "contact_info",
      label: selected_contact?.is_group ? "Group Info" : "Contact Info",
    },
  ];

  const onClick = (item) => {
    if (item?.key == "contact_info") setIsOpenDrawer(true);
  };

  return (
    <>
      <Dropdown menu={{ items, onClick }} placement="bottomLeft" arrow trigger={["click"]}>
        <ButtonCmp need_loader={false} shape="circle" type="text" icon={<Icon className="fa-solid fa-ellipsis-vertical" />} />
      </Dropdown>
      <SelectedContactInfo open={isOpenDrawer} setOpen={setIsOpenDrawer} />
    </>
  );
};

const Footer = ({ postMessageFn, message, setMessage, isLoadingPost }) => {
  const { colorPrimaryBgHover } = useColors();
  const {
    chats: { selected_contact_info },
  } = useCommunicationMainSlice();

  return (
    <form
      onSubmit={(e) => {
        e?.preventDefault();
        postMessageFn();
      }}
      style={{ backgroundColor: colorPrimaryBgHover }}
      className="df p-3 mt-2"
    >
      <InputBox disabled={selected_contact_info?.is_block} value={message} onChange={(e) => setMessage(e?.target?.value)} />
      <ButtonCmp disabled={!message} loading={isLoadingPost} htmlType="submit">
        Send
      </ButtonCmp>
    </form>
  );
};

const Messages = ({ reactRef }) => {
  const { messages } = useMessages();

  return (
    <div className="px-5 mt-2">
      <FlatList reactRef={reactRef} data={messages} renderItem={(message) => <Message message={message} key={message?.id} />} />
    </div>
  );
};

const Message = memo(({ message }) => {
  const {
    chats: { selected_contact },
  } = useCommunicationMainSlice();
  let is_sent = message?.is_sent;
  const { mutate: deleteSingleMessageMutate, isPending } = useMutation({ mutationKey: ["delete/single-message"], mutationFn: deleteSingleMessage });

  const Content = () => (
    <div style={{ minWidth: "100px" }} className="cp">
      <div
        className="p-1"
        onClick={() => deleteSingleMessageMutate({ id: message?.id, query: `?${selected_contact?.is_group ? `group_id=${selected_contact?.id}` : `user_id=${selected_contact?.id}`}` })}
      >
        <Para>Delete</Para>
      </div>
    </div>
  );

  return (
    <div className={`mb-1 ${is_sent ? "ae" : "df"} `}>
      {!is_sent && (
        <img
          src={message?.sender?.student_id ? message?.sender?.student?.applicant?.image ?? avatar : message?.sender?.staff?.image ?? avatar}
          style={{ height: 30, width: 30, objectFit: "cover", borderRadius: 50 }}
        />
      )}
      <div className={`message-${is_sent ? "sent" : "receive"} down_arrow_hover_show`}>
        <Popover placement="bottom" trigger={["click"]} content={Content} className="df">
          <Icon className="fa-solid fa-chevron-down down_arrow text-muted cp p-1" style={{ visibility: "hidden", position: "absolute", right: "5px", top: "5px" }} />
        </Popover>

        <div className="df">
          <div>
            {!is_sent && <Para style={{ fontSize: "12px" }}>{message?.sender?.student_id ? message?.sender?.student?.applicant?.name ?? "" : message?.sender?.staff?.name ?? ""}</Para>}
            <Para className="f1">{message?.message}</Para>
          </div>
          <div style={{ width: "40px" }}></div>
        </div>
        <LoaderCmp style={{ fontSize: "12px", position: "absolute", right: "3px", top: "3px", visibility: isPending ? "visible" : "hidden" }} />
        <small style={{ fontSize: "10px", position: "absolute", bottom: 0, right: 20 }}>{makeHHMMFromJSDate(new Date(message?.createdAt))}</small>
      </div>
    </div>
  );
});

const ScrollToBottom = ({ reactRef }) => {
  const scrollToBottom = () => {
    reactRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <ButtonCmp
      onClick={scrollToBottom}
      style={{ height: 40, width: 40, position: "absolute", bottom: 70, right: 10 }}
      className="rounded-5 p-0"
      type="text"
      icon={<Icon className="fa-solid fa-arrow-down" />}
    ></ButtonCmp>
  );
};
