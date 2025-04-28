import { CloseCircleFilled, EditFilled, SaveFilled } from "@ant-design/icons";
import { Breadcrumb, Tag } from "antd";
import { Link } from "react-router-dom";
import AuditLog from "src/components/layouts/audit";
import { CardCmp } from "src/components/layouts/container";
import FormWithHook from "src/components/layouts/form";
import { Icon, LoaderCmp, LoaderWithChildren } from "src/components/styled";
import useCreate from "./useCreate";

export default function AdminCreateEditProgramme() {
  const { control, form_data, programme_id, Modal, handleSubmit, isLoading, onSubmit, description, isEdit, setIsEdit, cls, isLoadingCls } = useCreate();
  return (
    <div>
      <Breadcrumb className="ms-3 mb-2" items={[{ title: "Programme", path: "/divider/admission/programme" }, { title: programme_id ? "Update" : "Create" }]} />
      <LoaderWithChildren isLoading={isLoading}>
        <form onSubmit={handleSubmit}>
          <CardCmp title={<Header cls={cls} isLoadingCls={isLoadingCls} isEdit={isEdit} setIsEdit={setIsEdit} programme_id={programme_id} />} className="mt-2">
            <FormWithHook is_edit={isEdit || !programme_id} className="col-lg-6" control={control} data={form_data} />
            <FormWithHook is_edit={isEdit || !programme_id} control={control} data={description} />
          </CardCmp>
        </form>
      </LoaderWithChildren>
      <Modal description={programme_id ? "Update programme" : "Create programme"} okButtonProps={{ onClick: onSubmit }} />
      <AuditLog record_id={programme_id} table_names={["programme"]} />
    </div>
  );
}

const Header = ({
  programme_id,
  isEdit,
  setIsEdit,
  cls,
  isLoadingCls,
}: {
  programme_id: number;
  isEdit: boolean;
  setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
  isLoadingCls: boolean;
  cls: any;
}) => {
  return (
    <div className="df">
      <div className="f1">
        {programme_id ? "Update programme" : "Create programme"}
        {isEdit || !programme_id ? (
          <>
            {programme_id && (
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
      <div>
        {programme_id &&
          (isLoadingCls ? (
            <LoaderCmp />
          ) : (
            <Link to={`/divider/admission/class/${programme_id}`} className="cp">
              <Icon className="fa-solid fa-landmark me-2" /> Class [{cls?.count}]
            </Link>
          ))}
      </div>
    </div>
  );
};
