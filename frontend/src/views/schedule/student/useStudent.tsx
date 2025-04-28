import { useQuery } from "@tanstack/react-query";
import { Tag } from "antd";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { makeJSDateToYYYYMMDD } from "src/functions/handleDate";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";

const getMySchedule = async ({ date }: { date: String }) => {
  if (!date) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  let response = await axiosInstance.get(`api/schedule/student-my-schedules/${date}`);
  return response?.response;
};

let attendance_status_color = {
  present: "green",
  absent: "red",
};
export default function useStudentSession() {
  const [search, setSearchParams] = useSearchParams();
  let string_date = search.get("date");
  let date = useMemo(() => (string_date ? new Date(string_date) : new Date()), [string_date]);
  const { data: schedule, isFetching, isLoading } = useQuery({ queryKey: ["get/schedule", date], queryFn: () => getMySchedule({ date: makeJSDateToYYYYMMDD(date) }) });

  let columns = [
    {
      dataIndex: "time",
      title: "Time",
    },
    {
      dataIndex: "hour",
      title: "Hour",
    },
    {
      dataIndex: "course",
      title: "Course",
    },
    {
      dataIndex: "staffs",
      title: "Staffs",
    },
    {
      dataIndex: "status",
      title: "Status",
      align: "center",
    },
  ];

  let dataSource = useMemo(() => {
    try {
      return schedule?.map((sch) => {
        let time_from = sch?.timetable?.hour?.time_from?.split(":")?.slice(0, 2)?.join(":");
        let time_to = sch?.timetable?.hour?.time_to?.split(":")?.slice(0, 2)?.join(":");
        return {
          time: `${time_from} - ${time_to}`,
          hour: sch?.timetable?.hour?.name,
          course: sch?.timetable?.course?.name,
          staffs: sch?.timetable?.staffs?.map((staff) => <Tag key={staff?.id}>{staff?.name}</Tag>),
          status: <Tag color={attendance_status_color?.[sch?.attendance_status?.id] ?? "orange"}>{sch?.attendance_status?.value ?? "Not Marked"}</Tag>,
        };
      });
    } catch (error) {
      console.error(error);
    }
  }, [schedule]);
  return { date, setSearchParams, isLoading, isFetching, columns, dataSource, schedule };
}
