import { Tabs, TabsProps } from "antd";
import Students from "./students";

export default function ScheduleTab({
  schedule_id,
  refetchSchedule,
  attendance,
  isLoadingAttendance,
}: {
  schedule_id: number;
  refetchSchedule: () => void;
  attendance: any;
  isLoadingAttendance: boolean;
}) {
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Students",
      children: <Students attendance={attendance} isLoadingAttendance={isLoadingAttendance} schedule_id={schedule_id} refetchSchedule={refetchSchedule} />,
    },
  ];
  return <Tabs defaultActiveKey="1" items={items} />;
}
