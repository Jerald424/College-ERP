import { useBase } from "src/redux/hooks";
import StudentDetailed from "../student/createEdit";
import { STUDENT } from "src/utils/variables";
import StaffDetailed from "../staff/createEdit";

export default function Profile() {
  const {
    user: { info },
  } = useBase();
  if (info?.role == STUDENT) return <StudentDetailed is_student />;
  else return <StaffDetailed is_profile />;
}
