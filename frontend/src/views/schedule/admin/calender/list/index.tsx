import { MoreOutlined, PlusOutlined } from "@ant-design/icons";
import { Breadcrumb, Dropdown, Table, Tag } from "antd";
import { isEmpty } from "lodash";
import { CardCmp } from "src/components/layouts/container";
import useApplicant from "./useApplicantIndex";
import { Link } from "react-router-dom";
import { ModalCmp, Para } from "src/components/styled";

export default function CalenderListView() {
  const { isLoading, columns, dataSource, pagination, setPagination, total_count, Modal, selected, setIsOpen, handleDelete, selectedDate, setSelectedDate } = useApplicant();

  return (
    <div>
      <Breadcrumb className="ms-3 mb-2" items={[{ title: "Calender", path: "/divider/schedule/calender" }, { title: "List" }]} />
      <CardCmp
        title={
          <div>
            <span className="me-3">Events</span>
            <Link to={"/divider/schedule/calender/event-create"}>
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
      <Modal description="To delete event" okButtonProps={{ onClick: handleDelete }} />
      <EventInfo selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
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

const EventInfo = ({ selectedDate, setSelectedDate }) => {
  return (
    <ModalCmp width={800} open={!!selectedDate} onCancel={() => setSelectedDate(false)} footer={null} title={`${selectedDate?.date} - Events`}>
      <Para>Class</Para>
      {selectedDate?.classes?.map((res) => (
        <Tag key={res?.id}>{res?.acronym}</Tag>
      ))}
      <Para className="mt-3">Title</Para>
      <Para className="fw-bold">{selectedDate?.title}</Para>
      <Para className="mt-3">Event</Para>
      {selectedDate?.event_name ? <div dangerouslySetInnerHTML={{ __html: selectedDate?.event_name }} /> : "-"}
    </ModalCmp>
  );
};
