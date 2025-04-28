import { PlusOutlined } from "@ant-design/icons";
import { Table, Tag } from "antd";
import { Link } from "react-router-dom";
import { CardCmp } from "src/components/layouts/container";
import useApplicant from "./useApplicantIndex";

export default function AdminFee() {
  const { isLoading, columns, dataSource, pagination, setPagination, total_count, handleEditOrCreate } = useApplicant();

  return (
    <div>
      <CardCmp
        title={
          <div>
            <span className="me-3">Application fee</span>
            <Link to={"collect"}>
              <Tag className="cp" color={"blue"} icon={<PlusOutlined />}>
                Collect
              </Tag>
            </Link>
          </div>
        }
      >
        <Table
          size="small"
          loading={isLoading}
          onRow={(record) => ({
            onClick: () => handleEditOrCreate(record),
            className: "cp",
          })}
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
