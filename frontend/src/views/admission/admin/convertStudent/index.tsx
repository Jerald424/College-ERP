import { CardCmp } from "src/components/layouts/container";
import useConvertStudent from "./useConvertStudent";
import { SaveFilled } from "@ant-design/icons";
import { isEmpty } from "lodash";
import { Table, Tag } from "antd";
import FormWithHook from "src/components/layouts/form";

export default function ConvertStudent() {
  const { control, form_data, columns, isLoading, dataSource, handleSelectDeselect, Modal, handleClickSave, setIsOpen, handleSelect, selected } = useConvertStudent();

  return (
    <form onSubmit={handleClickSave}>
      <CardCmp
        title={
          <div>
            Convert Student
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
