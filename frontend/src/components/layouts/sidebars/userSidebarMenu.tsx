import { Menu } from "antd";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useBase } from "src/redux/hooks";
import { COLLEGE, STAFF, STUDENT } from "src/utils/variables";
import { college_level_menu, staff_level_menu, student_level_menu } from "./constant";

export default function UserSidebar() {
  const navigate = useNavigate();
  const {
    user: { info },
  } = useBase();

  let menu_items = useMemo(() => {
    if (info?.role === COLLEGE) return college_level_menu;
    else if (info?.role === STAFF) return staff_level_menu;
    else if (info?.role === STUDENT) return student_level_menu;
  }, [info]);

  const handleNavigate = (e) => {
    let pathArr = e?.keyPath?.reverse();
    pathArr = pathArr?.filter((res) => !res?.includes("no_navigation"));
    let index = pathArr?.findIndex((res) => res?.includes("submenu"));
    if (index !== -1) pathArr?.splice(index, 1);
    let path = pathArr?.join("/");
    if (path) navigate(`/divider/${path}`);
  };

  return <Menu onClick={handleNavigate} mode="inline" defaultSelectedKeys={["users"]} defaultOpenKeys={["1"]} style={{ minHeight: "100%", borderRight: 0 }} items={menu_items} />;
}
