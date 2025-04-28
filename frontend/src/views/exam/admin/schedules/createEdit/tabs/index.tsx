import { Tabs, TabsProps } from "antd";
import ExamAttendance from "./attendance";
import ExamMarkEntry from "./markEntry";
import axiosInstance from "src/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useBase } from "src/redux/hooks";
import { COLLEGE } from "src/utils/variables";

const getStudents = async ({ exam_timetable_id }) => {
  if (!exam_timetable_id) return {};
  const response = await axiosInstance.get(`api/exam/schedules/student-list/${exam_timetable_id}`);
  return response;
};

export default function ExamScheduleTab({ exam_timetable_id, exam_timetable }: { exam_timetable_id: number; exam_timetable: any }) {
  const { data: students, isLoading } = useQuery({ queryKey: ["get/student", exam_timetable_id], queryFn: () => getStudents({ exam_timetable_id }) });
  const {
    user: { info },
  } = useBase();

  const items: TabsProps["items"] = useMemo(() => {
    let arr = [];
    if (info?.user?.staff_id == exam_timetable?.invigilator?.id || info?.role == COLLEGE)
      arr.push({
        key: "attendance",
        label: "Attendance",
        children: <ExamAttendance students={students} isLoading={isLoading} exam_timetable={exam_timetable} exam_timetable_id={exam_timetable_id} />,
      });
    let staff_ids = exam_timetable?.course?.staffs?.map((res) => res?.id);
    if (staff_ids?.includes(info?.user?.staff_id) || info?.role == COLLEGE)
      arr.push({
        key: "mark_entry",
        label: "Mark Entry",
        children: <ExamMarkEntry exam_timetable={exam_timetable} students={students} isLoadingStudents={isLoading} />,
      });
    return arr;
  }, [exam_timetable, info, students]);

  return <Tabs defaultActiveKey="attendance" items={items} />;
}
