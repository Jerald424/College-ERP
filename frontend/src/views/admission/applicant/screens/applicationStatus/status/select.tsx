import { useColors } from "src/redux/hooks";
import { StatusCardCmp } from ".";
import { Link } from "react-router-dom";
import { Alert, Result } from "antd";

export default function Select() {
  const { colorSuccess } = useColors();

  return (
    <StatusCardCmp text="Selected" color={colorSuccess}>
      <Alert
        banner
        message={
          <>
            Your application is selected. You can edit your application form {"    "}
            <Link to={"/admission/index/form"}>Edit</Link>
          </>
        }
      />
      <Result status={"success"} title="Your application is selected" />
    </StatusCardCmp>
  );
}
