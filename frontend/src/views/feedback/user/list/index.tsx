import { Table } from "antd";
import { CardCmp } from "src/components/layouts/container";
import useList from "./useList";
import { useNavigate } from "react-router-dom";

export default function UserFeedbackAnswer() {
  const { columns, dataSource, isLoading } = useList();
  const navigate = useNavigate();

  return (
    <CardCmp title="Feedback">
      <Table
        onRow={(data) => {
          return {
            className: "cp",
            onClick: () => navigate(`detail/${data?.id}`),
          };
        }}
        size="small"
        loading={isLoading}
        // bordered
        columns={columns}
        dataSource={dataSource}
        pagination={false}
      />
    </CardCmp>
  );
}
