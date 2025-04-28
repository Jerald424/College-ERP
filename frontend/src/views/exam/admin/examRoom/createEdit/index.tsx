import { CloseCircleFilled, EditFilled, SaveFilled } from "@ant-design/icons";
import { Breadcrumb, Tag } from "antd";
import { CardCmp, DividerCmp } from "src/components/layouts/container";
import FormWithHook from "src/components/layouts/form";
import { LoaderWithChildren, Para } from "src/components/styled";
import useCreate from "./useCreate";
import { useColors } from "src/redux/hooks";

export default function ExamRoomCreateEdit() {
  const { control, form_data, record_id, Modal, handleSubmit, navigate, isLoading, onSubmit, isEdit, setIsEdit, row, column } = useCreate();
  return (
    <div>
      <Breadcrumb className="ms-3 mb-2" items={[{ title: "Exam room", path: "/divider/exam/exam-room" }, { title: record_id ? "Update" : "Create" }]} />
      <LoaderWithChildren isLoading={isLoading}>
        <form onSubmit={handleSubmit}>
          <CardCmp title={<Header isEdit={isEdit} setIsEdit={setIsEdit} record_id={record_id} />} className="mt-2">
            <div className="row p-0 m-0">
              <FormWithHook is_edit={isEdit || !record_id} className="col-lg-6" control={control} data={form_data} />
              <RoomVisual column={column} row={row} />
            </div>
          </CardCmp>
        </form>
      </LoaderWithChildren>
      <Modal description={record_id ? "Update Exam room" : "Create Exam room"} okButtonProps={{ onClick: onSubmit }} />
    </div>
  );
}

const Header = ({ record_id, isEdit, setIsEdit }: { record_id: number; isEdit: boolean; setIsEdit: React.Dispatch<React.SetStateAction<boolean>> }) => {
  return (
    <div>
      {record_id ? "Update exam room" : "Create exam room"}
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
  );
};

const RoomVisual = ({ row, column }) => {
  const { colorPrimaryBg } = useColors();
  if (!!+row && !!+column)
    return (
      <div className="col-lg-6 daj overflow-auto">
        <div className="daj">
          <Para style={{ writingMode: "vertical-rl" }} className="m-0 mt-4">
            Column
          </Para>
          <div className="f1">
            <Para className="text-center">Rows</Para>

            {new Array(+column)?.fill(1)?.map((_, c_index) => {
              return (
                <div className="df">
                  {new Array(+row)?.fill(1)?.map((_, r_index) => (
                    <div style={{ height: "20px", width: "20px", backgroundColor: colorPrimaryBg, borderRadius: "2px" }} className="m-1 " key={`${c_index}_${r_index}`}></div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
};
