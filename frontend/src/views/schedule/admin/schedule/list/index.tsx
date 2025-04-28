import { MoreOutlined } from "@ant-design/icons";
import { Dropdown, Table, Tag } from "antd";
import { isEmpty } from "lodash";
import { CardCmp } from "src/components/layouts/container";
import useApplicant from "./useApplicantIndex";
import DropdownCmp from "src/components/styled/inputs/dropdown";

export default function ScheduleList() {
  const { isLoading, columns, dataSource, pagination, setPagination, total_count, Modal, selected, setIsOpen, handleDelete, selectedTerm, setSelectedTerm, terms } = useApplicant();

  return (
    <div>
      <CardCmp
        title={
          <div>
            <span className="me-3">Schedule</span>
            <DropdownCmp style={{ minWidth: 100 }} options={terms?.rows} optional_label="name" optional_value="id" handleChange={setSelectedTerm} value={selectedTerm} />
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
      <Modal description="To delete schedule" okButtonProps={{ onClick: handleDelete }} />
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
