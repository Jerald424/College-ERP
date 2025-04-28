import { Content } from "antd/es/layout/layout";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import PageNotFound from "src/components/layouts/screens/pageNotFound";
import withLazy from "src/hoc/withLazy";
import { useBase } from "src/redux/hooks";
const Dashboard = withLazy(() => import("../screens/dashboard"));
const ApplicationForm = withLazy(() => import("../screens/form"));
const ApplicationSuccess = withLazy(() => import("../screens/form/success"));
const ApplicationStatus = withLazy(() => import("../screens/applicationStatus"));

const AuthAdmission = () => {
  const { user } = useBase();
  if (user?.login) return <Outlet />;
  else return <Navigate to={"/admission/index"} />;
};

export default function ContentCmp() {
  return (
    <Content>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/form" element={<ApplicationForm />} />
        <Route path="/success" element={<ApplicationSuccess />} />
        <Route element={<AuthAdmission />}>
          <Route path="/application-status" element={<ApplicationStatus />} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Content>
  );
}
