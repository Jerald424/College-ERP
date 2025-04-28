import { Tabs } from "antd";
import CreateGroup from "./createGroup";
import Chat from "./chatList";
import NewChat from "./newChat";
import { useBase } from "src/redux/hooks";
import { useMemo } from "react";

export default function Chats() {
  let {
    user: { info },
  } = useBase();

  let items = useMemo(() => {
    try {
      let arr = [
        {
          label: "Chats",
          key: "chats",
          children: <Chat />,
        },
        {
          label: "New Chat",
          key: "new_chat",
          children: <NewChat />,
        },
      ];
      if (info?.role == "college")
        arr.push({
          label: "New Group",
          key: "new_group",
          children: <CreateGroup />,
        });
      return arr;
    } catch (error) {
      console.error(error);
    }
  }, [info]);
  return (
    <div className="h-100 reduce_scrollbar_width">
      <Tabs tabBarStyle={{ marginLeft: 20 }} className="h-100 " style={{ overflowY: "auto" }} defaultActiveKey="attendance" items={items} />
    </div>
  );
}
