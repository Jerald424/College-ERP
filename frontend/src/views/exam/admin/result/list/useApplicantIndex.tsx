import { useQuery } from "@tanstack/react-query";
import { Tag } from "antd";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import useFetchPaginatedData from "src/hooks/table/useFetchPaginated";
import { getExamConfigWithId } from "../../examConfig/createEdit/useCreate";

export default function useApplicant() {
  const params = useParams();
  let exam_config_id = params?.exam_config_id;

  const {
    data: { data, isPending, isFetching },
    paginate: { pagination, total_count, setPagination },
  } = useFetchPaginatedData({ url: `api/exam/exam-result-list/${exam_config_id}` });

  const { data: exam_config, isLoading: isLoadingExamConfig } = useQuery({
    queryKey: ["get/exam-config/id", exam_config_id],
    queryFn: () => getExamConfigWithId({ id: exam_config_id }),
  });

  const columns = [
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
      dataIndex: "student",
      title: "Student",
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
      let total_pass = exam_config?.external_pass_mark + exam_config?.internal_pass_mark;
      return data?.response?.rows?.map((res, index) => {
        let is_pass = (res?.internal_mark || 0) + (res?.external_mark || 0) >= total_pass;
        return {
          "s.no": index + 1,
          course: res?.course?.name,
          student: res?.student?.applicant?.name,
          internal: res?.internal_mark || 0,
          external: res?.external_mark || 0,
          status: <Tag color={is_pass ? "green-inverse" : "volcano-inverse"}>{is_pass ? "Pass" : "Fail"}</Tag>,
        };
      });
    } catch (error) {
      console.error("error: ", error);
    }
  }, [data, exam_config]);

  return { isLoading: isPending, columns, dataSource, pagination, setPagination, total_count, isFetching, isLoadingExamConfig, exam_config_id };
}
