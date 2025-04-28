import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import axiosInstance from "src/axiosInstance";
import { ArrowRightOutlined, AimOutlined } from "@ant-design/icons";
import { makeJsDateToDDMMYYYY } from "src/functions/handleDate";

const getForms = async () => {
  const response = await axiosInstance.get("api/feedback/user-feedback");
  return response;
};

export default function useList() {
  const { data: feedback_forms, isLoading } = useQuery({ queryKey: ["get/feedback/forms"], queryFn: getForms });

  const columns = [
    {
      dataIndex: "name",
      title: "Name",
    },
    {
      dataIndex: "date",
      title: "Date",
    },
    {
      dataIndex: "actions",
      title: "Actions",
      align: "center",
    },
  ];

  let dataSource = useMemo(() => {
    try {
      return feedback_forms?.response?.map((res) => ({
        ...res,
        date: (
          <div>
            {makeJsDateToDDMMYYYY(res?.start_date)}
            <ArrowRightOutlined className="mx-3" />
            {makeJsDateToDDMMYYYY(res?.end_date)}
          </div>
        ),
        actions: <AimOutlined />,
      }));
    } catch (error) {
      console.error(error);
    }
  }, [feedback_forms]);

  return { columns, isLoading, dataSource };
}
