import { theme } from "antd";
import { Link } from "react-router-dom";
import { Container } from "src/components/layouts/container";
import FormWithHook from "src/components/layouts/form";
import { ButtonCmp, Heading, LoaderWithChildren, Para } from "src/components/styled";
import useLoginIndex from "./hooks/useLoginIndex";

export default function LoginCmp() {
  const { colorBgBase } = theme.useToken().token;
  const { control, form_data, handleSubmit, isPending } = useLoginIndex();

  return (
    <Container className="df p-lg-5 flex-column vh-100 pb-3" style={{ overflowY: "auto" }}>
      <div className="row m-0 h-100" style={{ backgroundColor: colorBgBase }}>
        <div className="col-lg-6 px-lg-5  flex-column  df justify-content-evenly h-100" style={{ overflowY: "auto" }}>
          <div className="text-center">
            <img
              src={"https://img.freepik.com/free-vector/bird-colorful-logo-gradient-vector_343694-1365.jpg?size=338&ext=jpg&ga=GA1.1.523418798.1710633600&semt=sph"}
              alt="no-logo"
              style={{ width: "130px", height: "130px", objectFit: "contain" }}
            />
            <Heading>Login</Heading>
          </div>
          <form onSubmit={handleSubmit} className="my-4 container">
            <LoaderWithChildren isLoading={isPending}>
              <div style={{ maxWidth: "350px", margin: "0 auto" }}>
                <FormWithHook control={control} data={form_data} />
                <ButtonCmp htmlType="submit" type="primary" size="large" className="w-100 my-3">
                  Login
                </ButtonCmp>
              </div>
              <Link to={"/admission/index"}>
                <Para className="text-center">
                  Don't have an account? <b>Apply here</b>
                </Para>
              </Link>
            </LoaderWithChildren>
          </form>
        </div>
        <div className="col-lg-6 p-0 d-none d-lg-block h-100">
          <img
            src="https://img.freepik.com/free-photo/big-greek-bust-water_23-2150719268.jpg?t=st=1717087755~exp=1717091355~hmac=5f739b385b985b512bd1941ca4ace6c5f17f2a51834cff8e205670f548b34fbe&w=740"
            style={{ height: "100%", width: "100%", objectFit: "cover" }}
          />
        </div>
      </div>
    </Container>
  );
}
