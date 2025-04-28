import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import withLazy from "./hoc/withLazy.tsx";
import ChatPage from "./views/communication/index.tsx";
const MainWrapper = withLazy(() => import("./components/layouts/wrapper/mainWrapper.tsx"));

ReactDOM.createRoot(document.getElementById("root")!).render(
  <>
    {/* <ChatPage /> */}
    <MainWrapper>
      <App />
    </MainWrapper>
  </>
);
