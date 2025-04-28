import { Result } from "antd";
import { Link } from "react-router-dom";
import { ButtonCmp } from "src/components/styled";

export default function PageNotFound() {
  return (
    <Result
      status="404"
      title="404"
      subTitle="Sorry, the page you visited does not exist."
      extra={
        <Link to={"/"}>
          {" "}
          <ButtonCmp type="primary">Back Home</ButtonCmp>
        </Link>
      }
    />
  );
}
