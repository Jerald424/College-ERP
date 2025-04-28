import { CardCmp } from "src/components/layouts/container";
import useSelectApplicant from "./useSelectApplicant";
import FormWithHook from "src/components/layouts/form";
import { Table, Tag } from "antd";
import { isEmpty } from "lodash";
import { SaveFilled } from "@ant-design/icons";

export default function AdminSelectApplicant() {
  const { control, form_data, columns, isLoading, dataSource, handleSelectDeselect, Modal, handleClickSave, setIsOpen, handleSelect, selected } = useSelectApplicant();
  return (
    <form onSubmit={handleClickSave}>
      <CardCmp
        title={
          <div>
            Select Applicant
            {!isEmpty(selected) && (
              <>
                <label htmlFor="save">
                  <Tag className="ms-3 cp" color="success" icon={<SaveFilled />}>
                    Save
                  </Tag>
                </label>
                <button className="d-none" id="save" />
              </>
            )}
          </div>
        }
      >
        <FormWithHook className="col-lg-6" control={control} data={form_data} />
        <Table
          onRow={(data) => {
            return {
              onClick: () => handleSelectDeselect(data),
              className: "cp",
            };
          }}
          className="mt-3"
          size="small"
          loading={isLoading}
          // bordered
          columns={columns}
          dataSource={dataSource}
          pagination={false}
        />
        <Modal description="Select Applicant" okButtonProps={{ onClick: handleSelect }} />
      </CardCmp>
    </form>
  );
}
