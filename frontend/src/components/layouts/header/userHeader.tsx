import { Dropdown } from "antd";
import { Header } from "antd/es/layout/layout";
import { Link, useNavigate } from "react-router-dom";
import avatar from "src/assets/color_icon/man.png";
import { Heading } from "src/components/styled";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import { useAppDispatch, useBase, useColors } from "src/redux/hooks";
import initialBase from "src/redux/reducers/base/initialState";
import { addEditBase } from "src/redux/reducers/base/reducer";
import { STUDENT } from "src/utils/variables";
import { USER_TOKEN } from "src/views/login/hooks/useLoginIndex";
import AcademicYearSelect from "./academicYearSelect";
import { useMemo } from "react";

export const useLogoutUser = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem(USER_TOKEN);
    dispatch(addEditBase({ key: "user", value: initialBase.user }));
    navigate("/");
  };

  return { logout };
};

export default function UserHeader() {
  const { colorBgContainer, colorBorder } = useColors();
  const {
    user: { info },
  } = useBase();

  return (
    <Header
      className="px-2"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1,
        width: "100%",
        display: "flex",
        alignItems: "center",
        background: colorBgContainer,
        borderBottom: `1px solid ${colorBorder}`,
      }}
    >
      <InstitutionName />
      {info?.role !== STUDENT && <AcademicYearSelect />}
      <ProfileImage />
    </Header>
  );
}

const InstitutionName = () => {
  const {
    institution,
    user: { info },
  } = useBase();

  return (
    <div className="dajc f1">
      <img
        src={institution?.profile?.image ?? "https://img.freepik.com/free-vector/bird-colorful-logo-gradient-vector_343694-1365.jpg?size=338&ext=jpg&ga=GA1.1.523418798.1710633600&semt=sph"}
        alt="no-logo"
        style={{ width: "60px", height: "60px", objectFit: "contain" }}
      />
      <Heading className="ms-3 mb-0">
        {institution?.profile ? (
          institution?.profile?.name
        ) : info?.role == "college" ? (
          <Link to={"/divider/base/institution-profile/detail"} children="Create institution profile" />
        ) : (
          "Institution Info Not Yet Configured."
        )}
      </Heading>
    </div>
  );
};

const ProfileImage = () => {
  const {
    user: { info },
  } = useBase();
  const { Modal, setIsOpen } = useConfirmationModal();
  const { logout } = useLogoutUser();

  let menu = [
    { key: "name", label: info?.role == STUDENT ? info?.user?.student?.applicant?.name : info?.user?.staff?.name },
    { key: "logout", label: "Logout" },
  ];

  let image = useMemo(() => {
    if (info?.role == STUDENT) return info?.user?.student?.applicant?.image;
    else return info?.user?.staff?.image;
  }, [info]);
  const onClick = (arg) => {
    if (arg?.key == "logout") setIsOpen(true);
  };

  return (
    <>
      <Dropdown arrow menu={{ items: menu, onClick }} placement="bottomRight" trigger={["click"]}>
        <div className="cp">
          <img src={image ?? avatar} style={{ height: 40, width: 40, objectFit: "cover", borderRadius: 50 }} />
        </div>
      </Dropdown>
      <Modal description="To logout" okButtonProps={{ onClick: logout }} />
    </>
  );
};
