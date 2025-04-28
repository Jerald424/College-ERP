import { ButtonCmp } from "src/components/styled";
import DashboardCarousal from "./carousal";
import DashboardMarquee from "./marquee";
import Programme from "./programme";
import { Link } from "react-router-dom";
import { useBase } from "src/redux/hooks";

export default function Dashboard() {
  const {
    user: { login },
  } = useBase();
  return (
    <>
      <DashboardMarquee />
      <DashboardCarousal />
      <div className="text-center mt-3">
        <Link to={"form"}>
          <ButtonCmp size="large">{login ? "Update" : "Apply"} </ButtonCmp>
        </Link>
      </div>
      <Programme />
    </>
  );
}
