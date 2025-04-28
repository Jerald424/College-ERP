import { Alert, Table } from "antd";
import useStudent from "./useStudents";
import { ButtonCmp } from "src/components/styled";

export default function Students({
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
  const { columns, dataSource, isLoadingStudents, isLoadingUpdateAttendance, onSaveAttendance } = useStudent({ schedule_id, refetchSchedule, attendance });

  return (
    <div>
      <Alert banner message="Select absent student" type="info" />
      <Table loading={isLoadingStudents || isLoadingAttendance} size="small" columns={columns} dataSource={dataSource} pagination={false} />
      <div className="ae mt-3">
        <ButtonCmp loading={isLoadingUpdateAttendance} onClick={onSaveAttendance}>
          Save
        </ButtonCmp>
      </div>
    </div>
  );
}
