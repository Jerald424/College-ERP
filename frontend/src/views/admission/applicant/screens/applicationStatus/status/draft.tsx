import { useColors } from "src/redux/hooks";
import { StatusCardCmp } from ".";
import { Alert } from "antd";
import { Link } from "react-router-dom";

export default function Draft() {
  const { colorWarning } = useColors();
  return (
    <StatusCardCmp text="Draft" color={colorWarning}>
      <Alert
        banner
        message={
          <>
            Your application is draft. You can edit your application form until submit your application {"    "}
            <Link to={"/admission/index/form"}>Edit</Link>
          </>
        }
      />
    </StatusCardCmp>
  );
}
