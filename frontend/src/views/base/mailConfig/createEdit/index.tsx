import { CloseCircleFilled, EditFilled, SaveFilled } from "@ant-design/icons";
import { Breadcrumb, Tag } from "antd";
import { CardCmp } from "src/components/layouts/container";
import FormWithHook from "src/components/layouts/form";
import { LoaderWithChildren } from "src/components/styled";
import useCreate from "./useCreate";

export default function MailConfigCreateEdit() {
  const { control, form_data, record_id, Modal, handleSubmit, navigate, isLoading, onSubmit, isEdit, setIsEdit } = useCreate();
  return (
    <div>
      <Breadcrumb className="ms-3 mb-2" items={[{ title: "Mail Config", path: "/divider/base/mail-config" }, { title: record_id ? "Update" : "Create" }]} />
      <LoaderWithChildren isLoading={isLoading}>
        <form onSubmit={handleSubmit}>
          <CardCmp title={<Header isEdit={isEdit} setIsEdit={setIsEdit} record_id={record_id} />} className="mt-2">
            <FormWithHook is_edit={isEdit || !record_id} className="col-lg-6" control={control} data={form_data} />
          </CardCmp>
        </form>
      </LoaderWithChildren>
      <Modal description={record_id ? "Update mail config" : "Create mail config"} okButtonProps={{ onClick: onSubmit }} />
    </div>
  );
}

const Header = ({ record_id, isEdit, setIsEdit }: { record_id: number; isEdit: boolean; setIsEdit: React.Dispatch<React.SetStateAction<boolean>> }) => {
  return (
    <div>
      {record_id ? "Update mail config" : "Create mail config"}
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
