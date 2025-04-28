import { Layout } from "antd";
import React from "react";
import { useColors } from "src/redux/hooks";
import UserRoutes from "../routes/userRoutes";
import UserHeader from "../header/userHeader";
import UserSidebar from "../sidebars/userSidebarMenu";

const { Content, Footer, Sider } = Layout;

const App: React.FC = () => {
  const { colorBorder } = useColors();

  return (
    <Layout hasSider>
      <Sider style={{ overflow: "auto", height: "100vh", position: "fixed", left: 0, top: 0, bottom: 0, borderRight: `1px solid ${colorBorder}` }}>
        <UserSidebar />
      </Sider>
      <Layout style={{ marginLeft: 200 }}>
        <UserHeader />
        <Content className="container-fluid mt-3 position-relative">
          <UserRoutes />
        </Content>
        <Footer style={{ textAlign: "center" }}>Ant Design ©{new Date().getFullYear()} Created by Ant UED</Footer>
      </Layout>
    </Layout>
  );
};

export default App;
