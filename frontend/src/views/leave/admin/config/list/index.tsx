import { MoreOutlined, PlusOutlined } from "@ant-design/icons";
import { Dropdown, Table, Tag } from "antd";
import { isEmpty } from "lodash";
import { CardCmp } from "src/components/layouts/container";
import useApplicant from "./useApplicantIndex";
import { Link } from "react-router-dom";

export default function StaffLeaveConfigList() {
  const { isLoading, columns, dataSource, pagination, setPagination, total_count, Modal, selected, setIsOpen, handleDelete } = useApplicant();

  return (
    <div>
      <CardCmp
        title={
          <div>
            <span className="me-3">Staff Leave Type</span>
            <Link to={"detail"}>
              <Tag className="cp" color={"blue"} icon={<PlusOutlined />}>
                Create
              </Tag>
            </Link>
            {!isEmpty(selected) && <More setIsOpen={setIsOpen} />}
          </div>
        }
      >
        <Table
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
      <Modal description="To delete leave type" okButtonProps={{ onClick: handleDelete }} />
    </div>
  );
}

const More = ({ setIsOpen }) => {
  let items = [{ key: 1, label: <span onClick={() => setIsOpen(true)}>Delete</span> }];
  return (
    <Dropdown menu={{ items }} placement="bottomLeft" arrow trigger={["click"]}>
      <Tag className="cp" icon={<MoreOutlined />}></Tag>
    </Dropdown>
  );
};
