import { AimOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { Tag } from "antd";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useFetchPaginatedData from "src/hooks/table/useFetchPaginated";
import { leave_status_color } from "src/views/leave/admin/views/staffLeave/createEdit";

export default function useApplicant() {
  const {
    data: { data, isPending },
    paginate: { pagination, total_count, setPagination },
  } = useFetchPaginatedData({ url: "api/leave/my-approvals" });

  const navigate = useNavigate();
  const columns = [
    {
      dataIndex: "s.no",
      title: <div>#</div>,
      align: "center",
    },
    {
      dataIndex: "name",
      title: "Name",
    },
    {
      dataIndex: "date",
      title: "Date",
    },
    {
      dataIndex: "type",
      title: "Type",
    },
    {
      dataIndex: "status",
      title: "Status",
    },
    {
      dataIndex: "actions",
      title: "Actions",
      align: "center",
    },
  ];

  const handleEditOrCreate = (arg?: any) => {
    let str = arg ? `/divider/leave/leave-list/detail?id=${arg?.id}` : "/divider/leave/leave-list/detail";
    navigate(str);
  };

  let dataSource = useMemo(() => {
    try {
      return data?.response?.rows?.map((res, index) => ({
        id: res?.id,
        "s.no": <div>{index + 1}</div>,
        name: (
          <div>
            <img src={res?.staff?.image} style={{ height: 50, width: 50, borderRadius: 50 }} /> &nbsp;&nbsp;&nbsp;
            {res?.staff?.name}
          </div>
        ),
        date: (
          <div>
            {res?.start_date}
            <ArrowRightOutlined className="mx-2" />
            {res?.end_date}
          </div>
        ),
        type: res?.staff_leave_config?.name,
        status: <Tag color={leave_status_color?.[res?.status?.id]}>{res?.status?.value}</Tag>,
        actions: (
          <div>
            <AimOutlined style={{ fontSize: 20 }} />
          </div>
        ),
      }));
    } catch (error) {
      console.error("error: ", error);
    }
  }, [data]);
  return { isLoading: isPending, columns, dataSource, pagination, setPagination, total_count, handleEditOrCreate };
}
