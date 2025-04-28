import { CloseCircleFilled, EditFilled, SaveFilled, MailFilled } from "@ant-design/icons";
import { Alert, Breadcrumb, Tag } from "antd";
import { CardCmp } from "src/components/layouts/container";
import FormWithHook from "src/components/layouts/form";
import { LoaderCmp, LoaderWithChildren } from "src/components/styled";
import useCreate from "./useCreate";
import Ribbon from "antd/es/badge/Ribbon";
import Substitutions from "./substitutions";

export const leave_status_color = {
  draft: "gold",
  applied: "blue",
  approved: "green",
  rejected: "red",
};

export default function StaffLeaveCreateEdit() {
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
    selected_leave_type,
    error,
    isLoadingGetRemains,
    remainsDay,
    leave_data,
    DraftModal,
    makeAsDraft,
    setDraftOpen,
    isOpen,
    isLoadingSchedule,
    schedules,
    isLoadingSubstitute,
    is_approval,
  } = useCreate();

  return (
    <div>
      <Breadcrumb className="ms-3 mb-2" items={[{ title: "Leave", path: "/divider/leave/leave-list" }, { title: record_id ? "Update" : "Create" }]} />
      <LoaderWithChildren isLoading={isLoading}>
        <form onSubmit={handleSubmit}>
          <Ribbon color={leave_status_color?.[leave_data?.status?.id] ?? "blue"} text={leave_data?.status?.value ?? "Apply Leave"}>
            <CardCmp
              title={<Header is_approval={is_approval} setDraftOpen={setDraftOpen} error={error} isEdit={isEdit} setIsEdit={setIsEdit} record_id={record_id} leave_data={leave_data} />}
              className="mt-2"
            >
              <FormWithHook is_edit={isEdit || !record_id} className="grid-2" control={control} data={form_data} />
              <div className="ae mt-2">
                {isLoadingGetRemains && <LoaderCmp />}
                {remainsDay && selected_leave_type && (
                  <>
                    <Tag color="gold">Prev Taken: {remainsDay?.prev_taken_leave}</Tag>
                    <Tag color="blue">No Days: {remainsDay?.additional}</Tag>
                    <Tag color="green">Remain Days: {(selected_leave_type?.days || 0) - (remainsDay?.prev_taken_leave + remainsDay?.additional)}</Tag>
                  </>
                )}
              </div>
              {error && <Alert className="mt-2" banner type="error" message={error?.error} />}
              {selected_leave_type && (
                <Alert
                  className="mt-2"
                  banner
                  type={selected_leave_type?.type == "un_paid" ? "error" : "info"}
                  message={
                    selected_leave_type?.type == "un_paid"
                      ? "The selected leave type is not eligible for paid leave"
                      : `You are entitled to up to ${selected_leave_type?.days} paid leave days per ${selected_leave_type?.days_for?.value}`
                  }
                />
              )}
              {record_id && <Alert className="mt-2" banner message="If you edit the staff, date, or sessions, all substitutions will be cleared." />}
              <Substitutions isEdit={isEdit || !record_id} isLoadingSubstitute={isLoadingSubstitute} control={control} isLoadingSchedule={isLoadingSchedule} schedules={schedules} />
            </CardCmp>
          </Ribbon>
        </form>
      </LoaderWithChildren>
      <Modal description={record_id ? "Update leave " : "Create leave "} okButtonProps={{ onClick: onSubmit }} />
      <DraftModal description={`Make your leave request into ${isOpen} status`} okButtonProps={{ onClick: makeAsDraft }} />
    </div>
  );
}

const Header = ({
  record_id,
  isEdit,
  setIsEdit,
  error,
  leave_data,
  setDraftOpen,
  is_approval,
}: {
  record_id: number;
  isEdit: boolean;
  setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
  error: any;
  leave_data: any;
  setDraftOpen: any;
  is_approval: boolean;
}) => {
  return (
    <div>
      {record_id ? "Update leave " : "Create leave "}
      {isEdit || !record_id ? (
        <>
          {record_id && (
            <Tag onClick={() => setIsEdit(false)} className="ms-3 cp" color="error" icon={<CloseCircleFilled />}>
              Discard
            </Tag>
          )}
          <>
            <label htmlFor="save">
              <Tag className={`ms-3 cp ${!!error && "opacity-50"}`} color="success" icon={<SaveFilled />}>
                Save
              </Tag>
            </label>
            <button disabled={!!error} className="d-none" id="save" />
          </>
        </>
      ) : (
        <>
          <Tag onClick={() => setIsEdit(true)} className="ms-3 cp" color="blue" icon={<EditFilled />}>
            Edit
          </Tag>
          {leave_data?.status?.id == "applied" && (
            <Tag onClick={() => setDraftOpen("draft")} icon={<MailFilled />} color="gold" className="cp">
              Make as draft
            </Tag>
          )}
          {leave_data?.status?.id == "draft" && (
            <Tag onClick={() => setDraftOpen("applied")} icon={<MailFilled />} color="blue" className="cp">
              Make as applied
            </Tag>
          )}
          {is_approval && leave_data?.status?.id == "applied" && (
            <>
              <Tag onClick={() => setDraftOpen("approved")} icon={<MailFilled />} color="green" className="cp">
                Make as approved
              </Tag>
              <Tag onClick={() => setDraftOpen("rejected")} icon={<MailFilled />} color="red" className="cp">
                Make as rejected
              </Tag>
            </>
          )}
        </>
      )}
    </div>
  );
};
