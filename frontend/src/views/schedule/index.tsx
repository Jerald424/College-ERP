import { useBase } from "src/redux/hooks";
import StudentMySchedule from "./student";
import StaffMySchedules from "./staff";

export default function Schedule() {
  const {
    user: { info },
  } = useBase();
  if (info?.role == "student") return <StudentMySchedule />;
  else return <StaffMySchedules />;
}
