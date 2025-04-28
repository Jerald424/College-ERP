import { SaveFilled } from "@ant-design/icons";
import { Breadcrumb, Table, Tag } from "antd";
import { CardCmp } from "src/components/layouts/container";
import FormWithHook from "src/components/layouts/form";
import { ButtonCmp, LoaderWithChildren } from "src/components/styled";
import useCreate from "./useCreate";
import Ribbon from "antd/es/badge/Ribbon";
import { applicant_status_color } from "../../applicants/applicant";

export default function AdminApplicationFeeCollect() {
  const { control, form_data, Modal, handleSubmit, isLoading, onSubmit, columns, dataSource, is_disabled_save, is_no_due, SelectModal, setIsSelect, handleSelect, selected_applicant } = useCreate();
  return (
    <div>
      <Breadcrumb className="ms-3 mb-2" items={[{ title: "Application Fee", path: "/divider/admission/fee" }, { title: "Collect" }]} />
      <LoaderWithChildren isLoading={isLoading}>
        <form onSubmit={handleSubmit}>
          <Ribbon text={selected_applicant?.status?.value} color={applicant_status_color?.[selected_applicant?.status?.id]}>
            <CardCmp
              actions={is_no_due && selected_applicant?.status?.id == "submit" ? [<SelectApplication handleSelectApplicant={() => setIsSelect(true)} />] : []}
              title={<Header isDisabled={is_disabled_save} />}
              className="mt-2"
            >
              <FormWithHook className="col-lg-6" control={control} data={form_data} />
              <ApplicationFeeTable dataSource={dataSource} columns={columns} />
            </CardCmp>
          </Ribbon>
        </form>
      </LoaderWithChildren>
      <Modal description={"Collect fee"} okButtonProps={{ onClick: onSubmit }} />
      <SelectModal description="Select applicant" okButtonProps={{ onClick: handleSelect }} />
    </div>
  );
}

const Header = ({ isDisabled }) => {
  return (
    <div>
      Fee Collection
      <>
        {!isDisabled && (
          <label htmlFor="save">
            <Tag className="ms-3 cp" color="success" icon={<SaveFilled />}>
              Save
            </Tag>
          </label>
        )}
        <button className="d-none" id="save" />
      </>
    </div>
  );
};

const ApplicationFeeTable = ({ columns, dataSource }: { columns: any[]; dataSource: any[] }) => {
  return <Table pagination={false} size="small" columns={columns} dataSource={dataSource} />;
};

const SelectApplication = ({ handleSelectApplicant }: { handleSelectApplicant: () => void }) => {
  return (
    <div className="ae me-3">
      <ButtonCmp onClick={handleSelectApplicant}>Select</ButtonCmp>
    </div>
  );
};
