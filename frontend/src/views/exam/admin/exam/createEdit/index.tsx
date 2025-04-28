import { CloseCircleFilled, EditFilled, SaveFilled } from "@ant-design/icons";
import { Breadcrumb, Tag } from "antd";
import { CardCmp } from "src/components/layouts/container";
import FormWithHook from "src/components/layouts/form";
import { LoaderCmp, LoaderWithChildren } from "src/components/styled";
import useCreate from "./useCreate";
import { Link } from "react-router-dom";

export default function ExamCreateEdit() {
  const { control, form_data, record_id, Modal, handleSubmit, navigate, isLoading, onSubmit, isEdit, setIsEdit, isLoadingScheduleCount, schedule_count } = useCreate();
  return (
    <div>
      <Breadcrumb className="ms-3 mb-2" items={[{ title: "Exam", path: "/divider/exam/exam" }, { title: record_id ? "Update" : "Create" }]} />
      <LoaderWithChildren isLoading={isLoading}>
        <form onSubmit={handleSubmit}>
          <CardCmp title={<Header isLoadingScheduleCount={isLoadingScheduleCount} schedule_count={schedule_count} isEdit={isEdit} setIsEdit={setIsEdit} record_id={record_id} />} className="mt-2">
            <FormWithHook is_edit={isEdit || !record_id} className="col-lg-6" control={control} data={form_data} />
          </CardCmp>
        </form>
      </LoaderWithChildren>
      <Modal description={record_id ? "Update Exam" : "Create Exam"} okButtonProps={{ onClick: onSubmit }} />
    </div>
  );
}

const Header = ({
  record_id,
  isEdit,
  setIsEdit,
  isLoadingScheduleCount,
  schedule_count,
}: {
  record_id: number;
  isEdit: boolean;
  setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
  isLoadingScheduleCount: boolean;
  schedule_count: any;
}) => {
  return (
    <div className="df">
      <div className="f1">
        {record_id ? "Update exam" : "Create exam"}
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
      {record_id && isLoadingScheduleCount ? <LoaderCmp /> : <Link to={`/divider/exam/schedules?exam_id=${record_id}`}>Schedules [{schedule_count?.count}]</Link>}
    </div>
  );
};
