import { Alert, Table, Tag } from "antd";
import useAttendance from "./useAttendance";
import { ButtonCmp } from "src/components/styled";
import Ribbon from "antd/es/badge/Ribbon";

export default function ExamAttendance({ exam_timetable_id, exam_timetable, students, isLoading }) {
  const { columns, dataSource, handleSelect, handleSaveAttendance, isLoadingAttendance, isLoadingUpdateAttendance, count } = useAttendance({ exam_timetable_id, students });
  return (
    <Ribbon text={exam_timetable?.is_attendance_marked ? "Marked" : "Not Marked"} color={exam_timetable?.is_attendance_marked ? "green" : "red"}>
      <Alert banner type="info" message="Select absent student" />
      {exam_timetable?.is_attendance_marked && (
        <div className="ae m-2">
          <Tag color="green">Present {count?.present}</Tag>
          <Tag color="red">Absent {count?.absent}</Tag>
        </div>
      )}
      <Table
        onRow={(value) => {
          return {
            onClick: () => handleSelect({ id: value?.id }),
            className: "cp",
          };
        }}
        size="small"
        loading={isLoading || isLoadingAttendance}
        // bordered
        columns={columns}
        dataSource={dataSource}
        pagination={false}
      />
      <div className="ae  mt-3">
        <ButtonCmp loading={isLoadingUpdateAttendance} onClick={handleSaveAttendance}>
          Save
        </ButtonCmp>
      </div>
    </Ribbon>
  );
}
