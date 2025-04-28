import io from "socket.io-client";
import { BACKEND_DOMAIN } from "src/utils/colors";
import "./style.css";
import useCommunicationIndex from "./useIndex";

import texture from "src/assets/images/texture.png";
import MinSidebar from "./minSidebar";
import { useCommunicationMainSlice } from "./redux/store";
import RoutesCmp from "./routes";
import ChatScreen from "./screens/chats/chatScreen";

export const socket = io.connect(BACKEND_DOMAIN);

export default function StaffCommunication() {
  useCommunicationIndex();
  const { chats } = useCommunicationMainSlice();

  return (
    <div className="vh-100 df">
      <MinSidebar />
      <div className="row f1 m-0">
        <div className="col-4 p-0 h-100 bg-white">
          <RoutesCmp />
        </div>
        <div
          className={`col-8 p-0 h-100 ${chats?.selected_contact && "bg-dark-subtle"}`}
          style={{ ...(chats?.selected_contact && { backgroundImage: `url(${texture})`, backgroundRepeat: "repeat", backgroundSize: "cover" }) }}
        >
          <ChatScreen />
        </div>
      </div>
    </div>
  );
}
