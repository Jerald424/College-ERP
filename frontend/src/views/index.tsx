import { Navigate } from "react-router-dom";
import UserWrapper from "src/components/layouts/wrapper/userWrapper";
import { useBase } from "src/redux/hooks";

export default function ViewDividerIndex() {
  const { user } = useBase();

  if (user?.info?.["role"] == "applicant") return <Navigate to={"/admission/index/"} />;
  else return <UserWrapper />;
}

export function MainDivider() {
  return <Navigate to={"/divider"} />;
}
