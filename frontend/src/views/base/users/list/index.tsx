import { MoreOutlined, PlusOutlined } from "@ant-design/icons";
import { Dropdown, Table, Tag } from "antd";
import { isEmpty } from "lodash";
import { Link } from "react-router-dom";
import { CardCmp } from "src/components/layouts/container";
import useUsers from "./useUsers";

export default function Users() {
  const { columns, dataSource, isLoading, Modal, handleDelete, selected, setIsOpen, pagination, total_count, setPagination } = useUsers();

  return (
    <CardCmp
      title={
        <div>
          <span className="me-3">Users</span>
          <Link to={"create"}>
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
        bordered
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
      <Modal description="To delete user" okButtonProps={{ onClick: handleDelete }} />
    </CardCmp>
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
