import { Alert, Table, Tabs, TabsProps } from "antd";
import useAttendance from "./useAttendance";
import { ButtonCmp } from "src/components/styled";

export default function ScheduleTabs({ session_id, schedule_id, fetchSchedule }) {
  const items: TabsProps["items"] = [
    {
      key: "attendance",
      label: "Attendance",
      children: <Attendance session_id={session_id} schedule_id={schedule_id} fetchSchedule={fetchSchedule} />,
    },
  ];
  return <Tabs items={items} defaultActiveKey="attendance" />;
}

const Attendance = ({ session_id, schedule_id, fetchSchedule }) => {
  const { columns, dataSource, isLoadingPassenger, handleSubmit, isLoadingAttendance, isLoadingUpdateAttendance } = useAttendance({ session_id, schedule_id, fetchSchedule });
  return (
    <>
      <Alert banner message="Select who is present on the bus" type="info" />
      <Table loading={isLoadingAttendance} loading={isLoadingPassenger} columns={columns} dataSource={dataSource} size="small" pagination={false} />
      <ButtonCmp loading={isLoadingUpdateAttendance} onClick={handleSubmit} className="mt-3">
        Save
      </ButtonCmp>
    </>
  );
};
