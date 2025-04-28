import { Route, Routes } from "react-router-dom";
import withLazy from "src/hoc/withLazy";
const Chats = withLazy(() => import("../screens/chats"));
const Settings = withLazy(() => import("../screens/settings"));

export default function RoutesCmp() {
  return (
    <Routes>
      <Route path="/" element={<Chats />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}
