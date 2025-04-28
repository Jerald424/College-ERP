import { useBase } from "src/redux/hooks";
import ApplicantAdmissionIndex from "./applicant";

export default function Admission() {
  const {
    user: { login },
  } = useBase();
  return <ApplicantAdmissionIndex />;
}
