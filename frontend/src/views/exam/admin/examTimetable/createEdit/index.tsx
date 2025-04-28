import { CloseCircleFilled, EditFilled, SaveFilled, AimOutlined } from "@ant-design/icons";
import { Breadcrumb, Tag } from "antd";
import { CardCmp } from "src/components/layouts/container";
import FormWithHook from "src/components/layouts/form";
import { LoaderWithChildren, ModalCmp } from "src/components/styled";
import useCreate from "./useCreate";
import AllocateRoomModal from "./allocateRoom";
import RecordPagination from "src/components/layouts/recordPagination";

export default function ExamTimetableCreateEdit() {
  const {
    control,
    form_data,
    record_id,
    Modal,
    handleSubmit,
    navigate,
    isLoading,
    onSubmit,
    isEdit,
    setIsEdit,
    isOpenAllocateRoom,
    setIsOpenAllocateRoom,
    class_id,
    date,
    exam_room_id,
    exam_time_id,
    selected_room,
  } = useCreate();
  return (
    <div>
      <div className="dajc">
        <div className="f1">
          <Breadcrumb className="ms-3 mb-2" items={[{ title: "Exam timetable", path: "/divider/exam/timetables" }, { title: record_id ? "Update" : "Create" }]} />
        </div>
        <RecordPagination api_name="api/exam/exam-timetable/ids" />
      </div>
      <LoaderWithChildren isLoading={isLoading}>
        <form onSubmit={handleSubmit}>
          <CardCmp
            title={<Header isOpenAllocateRoom={isOpenAllocateRoom} setIsOpenAllocateRoom={setIsOpenAllocateRoom} isEdit={isEdit} setIsEdit={setIsEdit} record_id={record_id} />}
            className="mt-2"
          >
            <div className="row p-0 m-0">
              <FormWithHook is_edit={isEdit || !record_id} className="col-lg-6" control={control} data={form_data} />
            </div>
          </CardCmp>
        </form>
      </LoaderWithChildren>
      <Modal description={record_id ? "Update Exam timetable" : "Create Exam timetable"} okButtonProps={{ onClick: onSubmit }} />
      <AllocateRoomModal
        selected_room={selected_room}
        date={date}
        exam_room_id={exam_room_id}
        exam_time_id={exam_time_id}
        exam_timetable_id={record_id}
        class_id={class_id}
        isOpenAllocateRoom={isOpenAllocateRoom}
        setIsOpenAllocateRoom={setIsOpenAllocateRoom}
      />
    </div>
  );
}

const Header = ({
  record_id,
  isEdit,
  setIsEdit,
  isOpenAllocateRoom,
  setIsOpenAllocateRoom,
}: {
  record_id: number;
  isEdit: boolean;
  setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
  isOpenAllocateRoom: boolean;
  setIsOpenAllocateRoom: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <div className="df">
      <div className="f1">
        {record_id ? "Update exam timetable" : "Create exam timetable"}
        {isEdit || !record_id ? (
          <>
            {record_id && (
              <Tag onClick={() => setIsEdit(false)} className="ms-3 cp" color="error" icon={<CloseCircleFilled />}>
                Discard
              </Tag>
            )}
            <>
              <label htmlFor="save">
                <Tag className="ms-3 cp" color="success" icon={<SaveFilled />}>
                  Save
                </Tag>
              </label>
              <button className="d-none" id="save" />
            </>
          </>
        ) : (
          <Tag onClick={() => setIsEdit(true)} className="ms-3 cp" color="blue" icon={<EditFilled />}>
            Edit
          </Tag>
        )}
      </div>
      {record_id && (
        <div>
          <Tag onClick={() => setIsOpenAllocateRoom(true)} color="green" className="cp" icon={<AimOutlined />}>
            Allocate Room
          </Tag>
        </div>
      )}
    </div>
  );
};
