import { Tabs, TabsProps } from "antd";
import CampusYear from "./campusYear";

export default function StudentTab({ student }: { student: any }) {
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Campus year",
      children: <CampusYear data={student?.campus_year} />,
    },
  ];
  return <Tabs className="mt-3" defaultActiveKey="1" items={items} />;
}
