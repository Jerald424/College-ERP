import { EditFilled, SaveFilled, CloseCircleFilled } from "@ant-design/icons";
import { Breadcrumb, Tag } from "antd";
import Ribbon from "antd/es/badge/Ribbon";
import { CardCmp } from "src/components/layouts/container";
import FormWithHook from "src/components/layouts/form";
import { LoaderWithChildren } from "src/components/styled";
import Questions from "./questions";
import useDetail from "./useDetail";
import { NavLink } from "react-router-dom";

export default function UserFeedbackDetailed() {
  const { form, control, form_data, form_status, isLoading, isEdit, setIsEdit, onSubmit, Modal, onConfirmSave, isLoadingAnswerUpdate, isLoadingAnswer, user_id } = useDetail();
  return (
    <>
      {user_id ? (
        <Breadcrumb
          className="ms-3 mb-2"
          items={[
            { title: <NavLink to={"/divider/feedback/form"}> Feedback Form </NavLink> },
            { title: <NavLink to={`/divider/feedback/form/detail?id=${form?.id}`}> Feedback Form </NavLink> },
            { title: <NavLink to={`/divider/feedback/form/detail/report/${form?.id}`}> Reports </NavLink> },
            { title: "Answer Feedback" },
          ]}
        />
      ) : (
        <Breadcrumb className="ms-3 mb-2" items={[{ title: <NavLink to={"/divider/feedback/user/feedback-list"}>Feedback</NavLink> }, { title: "Answer Feedback" }]} />
      )}

      <Ribbon text={form_status?.status} color={form_status?.color}>
        <form onSubmit={onSubmit}>
          <CardCmp title={<Header user_id={user_id} setIsEdit={setIsEdit} isEdit={isEdit} form_status={form_status} form={form} />}>
            <LoaderWithChildren isLoading={isLoading || isLoadingAnswerUpdate || isLoadingAnswer}>
              <FormWithHook is_edit={false} className="grid-2" control={control} data={form_data} />
              <Questions isEdit={isEdit} control={control} form={form} />
            </LoaderWithChildren>
          </CardCmp>
        </form>
        <Modal description={"Submit feedback"} okButtonProps={{ onClick: onConfirmSave }} />
      </Ribbon>
    </>
  );
}

const Header = ({ form, form_status, isEdit, setIsEdit, user_id }) => {
  return (
    <div>
      {form?.name} - Feedback
      {isEdit ? (
        <>
          <Tag onClick={() => setIsEdit(false)} className="ms-3 cp" color="error" icon={<CloseCircleFilled />}>
            Discard
          </Tag>
          <label htmlFor="save">
            <Tag className="ms-3 cp" color="success" icon={<SaveFilled />}>
              Save
            </Tag>
          </label>
          <button className="d-none" id="save" />
        </>
      ) : (
        form_status?.is_edit &&
        !user_id && (
          <Tag onClick={() => setIsEdit(true)} className="ms-3 cp" color="blue" icon={<EditFilled />}>
            Edit
          </Tag>
        )
      )}
    </div>
  );
};
