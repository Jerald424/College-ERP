import { Table } from "antd";
import { useMemo } from "react";

export default function CampusYear({ data }: { data: any[] }) {
  let columns = [
    {
      dataIndex: "#",
      title: "#",
      align: "center",
    },
    {
      dataIndex: "academic_year",
      title: "Academic Year",
    },
    {
      dataIndex: "class",
      title: "Class",
    },
    {
      dataIndex: "status",
      title: "Status",
    },
  ];

  let dataSource = useMemo(() => {
    try {
      return data?.map((res, index) => ({
        "#": index + 1,
        academic_year: res?.academic_year?.name,
        class: res?.class?.name,
        status: res?.status?.value,
      }));
    } catch (error) {
      console.error(error);
    }
  }, [data]);

  return (
    <div>
      <Table bordered size="small" columns={columns} dataSource={dataSource} />
    </div>
  );
}
