import { Table } from "antd";
import { CardCmp } from "src/components/layouts/container";
import useApplicant from "./useApplicantIndex";

export default function StaffLeaveApprovalsList() {
  const { isLoading, columns, dataSource, pagination, setPagination, total_count, handleEditOrCreate } = useApplicant();

  return (
    <div>
      <CardCmp title="Staff Leave Approvals">
        <Table
          onRow={(data) => {
            return {
              onClick: (e) => handleEditOrCreate(data),
              className: "cp",
            };
          }}
          size="small"
          loading={isLoading}
          // bordered
          columns={columns}
          dataSource={dataSource}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: total_count,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20", "30", "40", "100", "200"],
          }}
          onChange={setPagination}
        />
      </CardCmp>
    </div>
  );
}
