import { useColors } from "src/redux/hooks";
import { StatusCardCmp } from ".";
import { Link } from "react-router-dom";
import { Alert, Result } from "antd";

export default function Rejected() {
  const { colorError } = useColors();

  return (
    <StatusCardCmp text="Rejected" color={colorError}>
      <Alert banner message={<>Sorry for the inconvenience. Please try another application</>} />
      <Result status={"error"} title="Your application is rejected" />
    </StatusCardCmp>
  );
}
