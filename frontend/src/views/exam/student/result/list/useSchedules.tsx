import { useQuery } from "@tanstack/react-query";
import { Tag } from "antd";
import { useMemo } from "react";
import axiosInstance from "src/axiosInstance";

const getStudentExamSchedule = async () => {
  const response = await axiosInstance.get("api/exam/student-result");
  return response;
};

export default function useSchedules() {
  const { data: exam_result, isLoading, isFetching } = useQuery({ queryKey: ["api/exam/student-result"], queryFn: getStudentExamSchedule });

  let columns = [
    {
      dataIndex: "s.no",
      title: "#",
      align: "center",
    },
    {
      dataIndex: "course",
      title: "Course",
    },
    {
      dataIndex: "internal",
      title: "Internal",
    },
    {
      dataIndex: "external",
      title: "External",
    },
    {
      dataIndex: "status",
      title: "Status",
    },
  ];

  let dataSource = useMemo(() => {
    try {
      let total_pass = exam_result?.response?.external_pass_mark + exam_result?.response?.internal_pass_mark;
      return exam_result?.response?.exam_result?.map((res, index) => {
        let total = res?.internal_mark + res?.external_mark;
        let is_pass = total >= total_pass;
        return {
          key: res?.id,
          "s.no": index + 1,
          course: res?.course?.name,
          internal: res?.internal_mark,
          external: res?.external_mark,
          status: <Tag color={is_pass ? "green" : "red"}>{is_pass ? "Pass" : "Fail"}</Tag>,
        };
      });
    } catch (error) {
      console.error(error);
    }
  }, [exam_result]);

  return { exam_result, columns, isLoading, dataSource, isFetching };
}
