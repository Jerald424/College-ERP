import { CloseCircleFilled, EditFilled, SaveFilled } from "@ant-design/icons";
import { Breadcrumb, Tag } from "antd";
import AuditLog from "src/components/layouts/audit";
import { CardCmp } from "src/components/layouts/container";
import FormWithHook from "src/components/layouts/form";
import { LoaderWithChildren } from "src/components/styled";
import useCreate from "./useCreate";

export default function StaffDetailed({ is_profile }: { is_profile?: boolean }) {
  const { control, form_data, isLoading, staff, Modal, handleSubmit, record_id, onSubmit, isEdit, setIsEdit, staff_id } = useCreate({ is_profile });

  return (
    <div>
      {!is_profile && <Breadcrumb className="ms-3 mb-2" items={[{ title: "Staff", path: "/divider/staff/list" }, { title: staff?.id ? staff?.name : "Create staff" }]} />}
      <LoaderWithChildren isLoading={isLoading}>
        <form onSubmit={handleSubmit}>
          <CardCmp title={<Header staff={staff} isEdit={isEdit} setIsEdit={setIsEdit} record_id={staff_id} />} className="mt-2">
            <FormWithHook is_edit={!record_id || isEdit} className="grid-2" control={control} data={form_data} />
          </CardCmp>
        </form>
      </LoaderWithChildren>
      {<AuditLog record_id={record_id} table_names={["staff", "staff_class"]} />}
      <Modal description={record_id ? "Update staff" : "Create staff"} okButtonProps={{ onClick: onSubmit }} />
    </div>
  );
}

const Header = ({ record_id, isEdit, setIsEdit, staff }: { record_id: number; isEdit: boolean; setIsEdit: React.Dispatch<React.SetStateAction<boolean>>; staff: any }) => {
  return (
    <div>
      {record_id ? staff?.name : "Create staff"}
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
