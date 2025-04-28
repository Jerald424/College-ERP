import { Layout } from "antd";
import { Route, Routes } from "react-router-dom";
import PageNotFound from "./components/layouts/screens/pageNotFound";
import { ModalLoader } from "./components/styled";
import useInitialState from "./hooks/useInitial";
import { useBase } from "./redux/hooks";
import { login_routes, un_auth_routes, un_login_routes } from "./utils/routes";

export default function App() {
  const { isLoadingVerifyUser } = useInitialState();
  const { user } = useBase();
  if (isLoadingVerifyUser) return <ModalLoader />;

  return (
    <Layout className="min-vh-100">
      <Routes>
        {un_auth_routes?.map((route) => {
          return (
            <Route key={route.path} path={route?.path}>
              {route?.children?.map((child_route) => (
                <Route key={route?.path + child_route?.path} path={child_route?.path} element={<child_route.component />} />
              ))}
            </Route>
          );
        })}
        {user?.login
          ? login_routes?.map((route) => {
              return (
                <Route key={route.path} path={route?.path}>
                  {route?.children?.map((child_route) => (
                    <Route key={route?.path + child_route?.path} path={child_route?.path} element={<child_route.component />} />
                  ))}
                </Route>
              );
            })
          : un_login_routes?.map((route) => {
              return (
                <Route key={route.path} path={route?.path}>
                  {route?.children?.map((child_route) => (
                    <Route key={route?.path + child_route?.path} path={child_route?.path} element={<child_route.component />} />
                  ))}
                </Route>
              );
            })}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Layout>
  );
}
