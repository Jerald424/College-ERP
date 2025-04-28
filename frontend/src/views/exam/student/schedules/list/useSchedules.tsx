import { useQuery } from "@tanstack/react-query";
import { Tag } from "antd";
import { useMemo } from "react";
import axiosInstance from "src/axiosInstance";

const getStudentExamSchedule = async () => {
  const response = await axiosInstance.get("api/exam/student-schedules");
  return response?.response;
};

export default function useSchedules() {
  const { data: exam_schedules, isLoading, error, isFetching } = useQuery({ queryKey: ["api/exam/student-schedules"], queryFn: getStudentExamSchedule });

  let columns = [
    {
      dataIndex: "s.no",
      title: "#",
      align: "center",
    },
    {
      dataIndex: "date",
      title: "Date",
    },
    {
      dataIndex: "course",
      title: "Course",
    },
    {
      dataIndex: "room",
      title: "Room",
    },
    {
      dataIndex: "invigilator",
      title: "Invigilator",
    },
    {
      dataIndex: "status",
      title: "Status",
    },
    {
      dataIndex: "mark",
      title: "Mark",
    },
  ];

  let dataSource = useMemo(() => {
    try {
      return exam_schedules?.allocated?.map((res, index) => {
        return {
          id: res?.id,
          "s.no": index + 1,
          date: res?.exam_timetable?.date,
          course: res?.exam_timetable?.course?.name,
          room: res?.exam_timetable?.exam_room?.name,
          invigilator: res?.exam_timetable?.invigilator?.name,
          status: res?.exam_timetable?.is_attendance_marked ? res?.exam_timetable?.is_present ? <Tag color="green">Present</Tag> : <Tag color="red">Absent</Tag> : <Tag color="gold">Not Marked</Tag>,
          mark: res?.exam_timetable?.exam_mark?.mark ?? <Tag color="gold">Not Entered</Tag>,
        };
      });
    } catch (error) {
      console.error(error);
    }
  }, [exam_schedules]);

  return { error, exam_schedules, columns, isLoading, dataSource, isFetching };
}
