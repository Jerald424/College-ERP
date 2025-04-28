import { CloseCircleFilled, EditFilled, SaveFilled } from "@ant-design/icons";
import { Breadcrumb, Tag } from "antd";
import { Link } from "react-router-dom";
import { CardCmp } from "src/components/layouts/container";
import FormWithHook from "src/components/layouts/form";
import { LoaderWithChildren } from "src/components/styled";
import useCreate from "./hooks/useCreate";
import FormQuestions from "./questions";

export default function FeedbackFormCreateEdit() {
  const { control, form_data, record_id, Modal, handleSubmit, navigate, isLoading, onSubmit, isEdit, setIsEdit, setValue, watch, reset, data } = useCreate();

  let is_edit = isEdit || !record_id;
  return (
    <div>
      <Breadcrumb className="ms-3 mb-2" items={[{ title: "Feedback form", path: "/divider/feedback/form" }, { title: record_id ? "Update" : "Create" }]} />
      <LoaderWithChildren isLoading={isLoading}>
        <form onSubmit={handleSubmit}>
          <CardCmp title={<Header isEdit={isEdit} setIsEdit={setIsEdit} record_id={record_id} />} className="mt-2">
            <FormWithHook is_edit={is_edit} className="col-lg-6" control={control} data={form_data} />
            <FormQuestions data={data} is_edit={is_edit} reset={reset} watch={watch} setValue={setValue} />
          </CardCmp>
        </form>
      </LoaderWithChildren>
      <Modal description={record_id ? "Update form" : "Create form"} okButtonProps={{ onClick: onSubmit }} />
    </div>
  );
}

const Header = ({ record_id, isEdit, setIsEdit }: { record_id: number; isEdit: boolean; setIsEdit: React.Dispatch<React.SetStateAction<boolean>> }) => {
  return (
    <div className="dajc">
      <div className="f1">
        {record_id ? "Update form" : "Create form"}
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
      <div>{record_id && <Link to={`report/${record_id}`}>Reports</Link>}</div>
    </div>
  );
};
