import { Breadcrumb, Table } from "antd";
import { useMemo } from "react";
import { CardCmp, DividerCmp } from "src/components/layouts/container";
import FormWithHook from "src/components/layouts/form";
import { ButtonCmp, CheckBoxCmp, LoaderWithChildren, SubHeading } from "src/components/styled";
import useTablePagination from "src/hooks/table/useTablePagination";
import useCreate from "./useCreate";

export default function CreateRole() {
  const { control, form_data, user_id, Modal, handleSubmit, navigate, isLoading, onSubmit, support_data, selectedPermissions, setSelectedPermissions, isLoadingSupportData } = useCreate();
  return (
    <div>
      <Breadcrumb className="ms-3 mb-2" items={[{ title: "Roles", path: "/divider/base/roles" }, { title: user_id ? "Update" : "Create" }]} />
      <LoaderWithChildren isLoading={isLoading}>
        <form onSubmit={handleSubmit}>
          <CardCmp
            actions={[
              <div className="ae me-3">
                <ButtonCmp onClick={() => navigate("/divider/base/roles")} type="link" className="me-3">
                  Discard
                </ButtonCmp>
                <ButtonCmp htmlType="submit">Save</ButtonCmp>
              </div>,
            ]}
            title={user_id ? "Update role" : "Create role"}
            className="mt-2"
          >
            <FormWithHook className="col-lg-6" control={control} data={form_data} />
            <DividerCmp />
            <Permissions isLoading={isLoadingSupportData} selected={selectedPermissions} setSelected={setSelectedPermissions} permissions={support_data?.["permissions"]} />
          </CardCmp>
        </form>
      </LoaderWithChildren>
      <Modal description={user_id ? "Update user" : "Create user"} okButtonProps={{ onClick: onSubmit }} />
    </div>
  );
}

const Permissions = ({ permissions, isLoading, setSelected, selected }: { permissions: any; isLoading: boolean; setSelected: React.Dispatch<React.SetStateAction<{}>>; selected: any }) => {
  const { pagination, setPagination } = useTablePagination();

  let columns = [
    {
      dataIndex: "s.no",
      title: "#",
      align: "center",
    },
    {
      dataIndex: "table",
      title: "Table",
    },
    {
      dataIndex: "view",
      title: "View",
      align: "center",
    },
    {
      dataIndex: "update",
      title: "Update",
      align: "center",
    },
  ];

  const handleChange = ({ res, type }: { res: any; type: "view" | "update" }) => {
    try {
      setSelected((prev) => {
        let tmp = { ...prev };
        if (!tmp[res?.model]) tmp[res?.model] = [];
        if (tmp[res?.model]?.includes(type)) {
          let index = tmp[res?.model]?.indexOf?.(type);
          if (index !== -1) tmp[res?.model]?.splice(index, 1);
        } else tmp[res?.model].push(type);
        return tmp;
      });
    } catch (error) {
      console.error(error);
    }
  };

  let dataSource = useMemo(() => {
    try {
      return permissions?.["model_permissions"]?.map((res, index) => ({
        "s.no": index + 1,
        table: res?.label,
        view: <CheckBoxCmp checked={selected?.[res?.model]?.includes?.("view")} onChange={() => handleChange({ res, type: "view" })} />,
        update: <CheckBoxCmp checked={selected?.[res?.model]?.includes?.("update")} onChange={() => handleChange({ res, type: "update" })} />,
      }));
    } catch (error) {
      console.error(error);
    }
  }, [permissions, selected]);

  return (
    <div className="mt-3">
      <SubHeading>Permissions</SubHeading>
      <Table
        size="small"
        loading={isLoading}
        bordered
        columns={columns}
        dataSource={dataSource}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: dataSource?.length,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20", "30", "40", "100", "200"],
        }}
        onChange={setPagination}
      />
    </div>
  );
};
