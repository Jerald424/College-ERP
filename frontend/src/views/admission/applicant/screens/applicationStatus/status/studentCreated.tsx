import { Alert } from "antd";
import { useColors } from "src/redux/hooks";
import { StatusCardCmp } from ".";

export default function StudentCreated() {
  const { colorSuccessActive } = useColors();
  return (
    <StatusCardCmp text="Student Created" color={colorSuccessActive}>
      <Alert banner message={<>Your application is Profile created. You can login your student portal</>} />
    </StatusCardCmp>
  );
}
