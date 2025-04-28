import { Route, Routes } from "react-router-dom";
import { user_routes } from "./userRouteData";
import PageNotFound from "../screens/pageNotFound";

export default function UserRoutes() {
  return (
    <Routes>
      {user_routes?.map((route) => {
        return (
          <Route key={route?.path} path={route?.path}>
            {route?.children?.map((cRoute) => (
              <Route path={cRoute?.path} element={<cRoute.component />} />
            ))}
          </Route>
        );
      })}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}
