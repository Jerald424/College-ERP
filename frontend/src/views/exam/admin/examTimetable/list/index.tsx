import { MoreOutlined, PlusOutlined } from "@ant-design/icons";
import { Dropdown, Table, Tag } from "antd";
import { isEmpty } from "lodash";
import { CardCmp } from "src/components/layouts/container";
import useApplicant from "./useApplicantIndex";
import { Link } from "react-router-dom";
import { LoaderCmp } from "src/components/styled";

export default function ExamTimetableList() {
  const { isLoading, columns, dataSource, pagination, setPagination, total_count, Modal, selected, setIsOpen, handleDelete, isFetching } = useApplicant();

  return (
    <div>
      <CardCmp
        title={
          <div>
            <span className="me-3">Exam timetable</span>
            <Link to={"detail"}>
              <Tag className="cp" color={"blue"} icon={<PlusOutlined />}>
                Create
              </Tag>
            </Link>
            {!isEmpty(selected) && <More setIsOpen={setIsOpen} />}
            <LoaderCmp style={{ visibility: isFetching ? "visible" : "hidden" }} />
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
      <Modal description="To delete exam timetable" okButtonProps={{ onClick: handleDelete }} />
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
