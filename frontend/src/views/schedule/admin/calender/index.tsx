import { MoreOutlined } from "@ant-design/icons";
import { Calendar, Dropdown, Table, Tag } from "antd";
import format, { Dayjs } from "dayjs";
import { isEmpty } from "lodash";
import { CardCmp } from "src/components/layouts/container";
import { LoaderCmp, ModalCmp } from "src/components/styled";
import useCalenderIndex from "./hooks/useCalende";
import { useNavigate } from "react-router-dom";

export interface AdminCalenderPartProps {
  is_create?: boolean;
  handleSelectDate?: (date: Dayjs) => void;
  selectedDate?: string[];
}

export const AdminCalenderPart = (props: AdminCalenderPartProps) => {
  const { date, isLoadingCalender, cellRender, handleChangeDate, isOpenModal, setIsOpenModal, isLoadingGetSingleDay, event_columns, event_data_source, Modal, handleDelete, setIsOpen, selected } =
    useCalenderIndex(props);

  return (
    <>
      <div style={{ position: "relative" }}>
        <LoaderCmp style={{ position: "absolute", display: isLoadingCalender ? "block" : "none" }} />
        <Calendar onSelect={handleChangeDate} value={format(date)} mode="month" cellRender={cellRender} />
      </div>
      <ModalCmp
        title={
          <div>
            Events {"  "}
            {!isEmpty(selected) && <More setIsOpen={setIsOpen} />}
          </div>
        }
        width={800}
        open={isOpenModal}
        onCancel={() => setIsOpenModal(false)}
        footer={null}
        closeIcon={null}
      >
        <Table size="small" pagination={false} loading={isLoadingGetSingleDay} columns={event_columns} dataSource={event_data_source} />
      </ModalCmp>
      <Modal description="To delete event" okButtonProps={{ onClick: handleDelete }} />
    </>
  );
};

export default function AdminCalender() {
  return (
    <CardCmp
      style={{ zIndex: 0 }}
      title={
        <div>
          Calender &nbsp;&nbsp;
          <CalenderMore />
        </div>
      }
      className="mt-2"
    >
      <AdminCalenderPart />
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

const CalenderMore = () => {
  const navigate = useNavigate();
  let items = [
    { key: "event-create", label: "Create Event" },
    { key: "calender-list", label: "Event List" },
  ];
  return (
    <Dropdown menu={{ items, onClick: (val) => navigate(val?.key) }} placement="bottomLeft" arrow trigger={["click"]}>
      <Tag className="cp" icon={<MoreOutlined />}></Tag>
    </Dropdown>
  );
};
