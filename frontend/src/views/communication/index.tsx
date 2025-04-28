import { BrowserRouter, Route, Routes } from "react-router-dom";
import UserSelection from "./userSelection";
import Chat from "./chat";

export default function ChatPage() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserSelection />} />
        <Route path="/chat/:user_id/:group_id" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  );
}
