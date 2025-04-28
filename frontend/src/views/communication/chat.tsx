import { useParams } from "react-router-dom";
import { group, socket, users } from "./userSelection";
import { Tag } from "antd";
import { useEffect, useState } from "react";
import { ButtonCmp, InputBox, SubHeading } from "src/components/styled";

export default function Chat() {
  const [groupChats, setGroupChats] = useState([]);
  const [selectedUser, setSelectedUser] = useState();

  const { user_id, group_id } = useParams();
  let selected_group = group.find((res) => res?.id == group_id);
  let selected_user = users.find((res) => res?.id == user_id);

  const onSend = ({ message }) => {
    if (selectedUser?.is_group) socket.emit("chat_group", { message, group_id, sender_id: user_id });
    else {
      socket.emit("chat_private", { receiver_id: String(selectedUser?.id), message, sender_id: user_id });
    }
  };

  useEffect(() => {
    socket.emit("join_room", { group_id });
    socket.emit("join_user", { user_id });
  }, []);

  useEffect(() => {
    socket.on("receive_group_message", (data) => {
      data["sender"] = users?.find((res) => res?.id == data?.sender_id);
      setGroupChats((prev) => [...prev, data]);
    });
    socket.on("receive_private_message", (data) => {
      data["sender"] = users?.find((res) => res?.id == data?.sender_id);
      setGroupChats((prev) => [...prev, data]);
    });
  }, [socket]);

  return (
    <div className="container py-4 vh-100 ">
      <div className="row card h-100">
        <div className="col-4 overflow-y-auto h-100">
          <div className="p-3">
            <Tag>{selected_user?.name}</Tag>
            <Tag>{selected_group?.name}</Tag>
          </div>
          <div
            onClick={() => setSelectedUser({ ...selected_group, is_group: true })}
            className={`dajc cp my-2 p-2 ${selected_group?.id == selectedUser?.id ? "border border-success bg-success-subtle" : "border-bottom"}`}
          >
            <div style={{ height: 40, width: 40, borderRadius: 50 }} className="daj bg-info-subtle">
              <h6 className="text-uppercase m-0">{selected_group?.name?.slice(0, 2)}</h6>
            </div>
            <SubHeading className="f1 ms-3 mb-0">{selected_group?.name}</SubHeading>
          </div>
          <UserList setSelectedUser={setSelectedUser} selectedUser={selectedUser} />
        </div>
        <div className="col-8 bg-secondary-subtle h-100 d-flex flex-column">
          <div className="f1 overflow-y-auto">
            <div className="p-3">
              {groupChats?.map((chat) => (
                <SepMessage message={chat} />
              ))}
            </div>
          </div>
          <SendPart onSend={onSend} />
        </div>
      </div>
    </div>
  );
}

const SepMessage = ({ message }) => {
  return (
    <div className="df mb-3">
      <div style={{ height: 40, width: 40, borderRadius: 50 }} className="daj bg-info-subtle">
        <h6 className="text-uppercase m-0">{message?.sender?.name?.slice(0, 2)}</h6>
      </div>
      <div className="f1 ms-3 ">
        <div style={{ width: "max-content" }} className="bg-info-subtle p-3 rounded">
          {message?.message}
        </div>
      </div>
    </div>
  );
};

const SendPart = ({ onSend }) => {
  const [message, setMessage] = useState("");

  const handleSent = (e) => {
    e?.preventDefault();
    onSend({ message });
    setMessage("");
  };

  return (
    <form onSubmit={handleSent} className="p-2 df">
      <InputBox value={message} onChange={(e) => setMessage(e?.target?.value)} className="f1" />
      <ButtonCmp htmlType="submit">Send</ButtonCmp>
    </form>
  );
};

const UserList = ({ selectedUser, setSelectedUser }) => {
  return (
    <div>
      {users?.map((user) => {
        return (
          <div key={user?.id} className={`dajc cp  my-2 p-2 ${user?.id == selectedUser?.id ? "border border-success bg-success-subtle" : "border-bottom"}`} onClick={() => setSelectedUser(user)}>
            <div style={{ height: 40, width: 40, borderRadius: 50 }} className="daj bg-info-subtle">
              <h6 className="text-uppercase m-0">{user?.name?.slice(0, 2)}</h6>
            </div>
            <SubHeading className="f1 ms-3 mb-0">{user?.name}</SubHeading>
          </div>
        );
      })}
    </div>
  );
};
