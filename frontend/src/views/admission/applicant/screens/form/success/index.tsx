import React, { useEffect, useMemo } from "react";
import { Alert, Button, Result } from "antd";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { retrieveDataFromBase64 } from "src/functions/handleData";
import { isEmpty } from "lodash";

const ApplicationSuccess: React.FC = () => {
  const [search] = useSearchParams();
  const navigate = useNavigate();
  let route_data = useMemo(() => {
    try {
      let success = search.get("data");
      if (success) return retrieveDataFromBase64(success);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    if ([route_data?.username, route_data?.password].some((res) => !res)) navigate("/admission/index/form");
  }, []);

  return (
    <Result
      status="success"
      title="Thank you for filling application form."
      subTitle={`Here is your login credentials Login: ${route_data?.username}, Password: ${route_data?.password}`}
      children={
        <>
          <Alert type="info" banner message={`Your application no will be generate after submit the application`} />
        </>
      }
      extra={[
        <Link to={"/"}>
          <Button key="buy" type="primary">
            Login
          </Button>
        </Link>,
      ]}
    />
  );
};

export default ApplicationSuccess;
