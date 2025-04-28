import { Alert, Breadcrumb } from "antd";
import { CardCmp } from "src/components/layouts/container";
import FormWithHook from "src/components/layouts/form";
import { ButtonCmp, LoaderWithChildren } from "src/components/styled";
import useCreate from "./useCreate";

export default function UserCreate() {
  const { control, form_data, handleSubmit, active, Modal, onSubmit, isPending, user_id, navigate } = useCreate();

  return (
    <>
      <Breadcrumb className="ms-3 mb-2" items={[{ title: "Users", path: "/divider/base/users" }, { title: user_id ? "Update" : "Create" }]} />
      <LoaderWithChildren isLoading={isPending}>
        <form onSubmit={handleSubmit}>
          <CardCmp
            actions={[
              <div className="ae me-3">
                <ButtonCmp onClick={() => navigate("/divider/base/users")} type="link" className="me-3">
                  Discard
                </ButtonCmp>
                <ButtonCmp htmlType="submit" disabled={!active}>
                  Save
                </ButtonCmp>
              </div>,
            ]}
            title={user_id ? "Update User" : "Create User"}
            className="mt-2"
          >
            <FormWithHook className="col-lg-6" control={control} data={form_data} />
            <Alert message="Please select any one role to active." banner className="mt-3" />
          </CardCmp>
        </form>
      </LoaderWithChildren>
      <Modal description={user_id ? "Update user" : "Create user"} okButtonProps={{ onClick: onSubmit }} />
    </>
  );
}
