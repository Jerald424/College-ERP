import { Dropdown } from "antd";
import { Header } from "antd/es/layout/layout";
import { Link, useNavigate } from "react-router-dom";
import { Heading } from "src/components/styled";
import { useAppDispatch, useBase, useColors } from "src/redux/hooks";
import initialBase from "src/redux/reducers/base/initialState";
import { addEditBase } from "src/redux/reducers/base/reducer";
import { ADMISSION_TOKEN } from "src/views/login/hooks/useLoginIndex";
import { DownCircleFilled } from "@ant-design/icons";

const useApplicantLogout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem(ADMISSION_TOKEN);
    dispatch(addEditBase({ key: "user", value: initialBase.user }));
    navigate("/");
  };

  return { logout };
};

export default function HeaderCmp() {
  const { colorPrimary, colorBgContainer } = useColors();

  const { logout } = useApplicantLogout();
  const {
    user: { info, login },
    institution: { profile },
  } = useBase();

  let items = [
    { key: "form", label: <Link to={"form"}>Form</Link> },
    { key: "app-status", label: <Link to={"application-status"}>Application Status</Link> },
    { key: "logout", label: <span>Logout</span> },
  ];

  let unAuthMenu = [
    { key: "dashboard", label: <Link to={"/admission/index"}>Dashboard</Link> },
    { key: "login", label: <Link to={"/"}>Login</Link> },
  ];

  const onSelectMenu = (val) => {
    if (val?.key == "logout") logout();
  };

  return (
    <Header style={{ backgroundColor: colorPrimary }} className="dajc">
      <img
        src={
          profile?.image ??
          "https://img.freepik.com/free-vector/colorful-bird-illustration-gradient_343694-1741.jpg?w=740&t=st=1717603894~exp=1717604494~hmac=5fc66d40b07c4a00e63fe9739c9002fc29e812a0703857f4db076c2e6f3fb3cb"
        }
        style={{ height: 50, width: 50, objectFit: "contain" }}
      />
      <Heading style={{ color: colorBgContainer }} className="f1 text-center mb-0">
        {profile?.name ?? "Institution profile not yet configured"}
      </Heading>
      {login ? (
        <Dropdown arrow menu={{ items, onClick: onSelectMenu }} placement="bottomRight" trigger={["click"]}>
          <img className="cp" src={info?.applicant?.image} style={{ height: 50, width: 50, borderRadius: 50 }} />
        </Dropdown>
      ) : (
        <Dropdown arrow menu={{ items: unAuthMenu }} placement="bottomRight" trigger={["click"]}>
          <div className="cp" style={{ color: colorBgContainer }}>
            Menu <DownCircleFilled className="ms-2" />
          </div>
        </Dropdown>
      )}
    </Header>
  );
}
