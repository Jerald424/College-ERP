import { AimOutlined } from "@ant-design/icons";
import { Table, Tag } from "antd";
import useAllocateLeave from "./useAllocateLeave";
import { ButtonCmp, ModalCmp } from "src/components/styled";

export default function AllocateLeave({ leave_type_id }) {
  const { isOpen, setIsOpen, columns, dataSource, isLoadingStaffCredits, isLoadingAllocateCredits, onSubmit } = useAllocateLeave({ leave_type_id });
  return (
    <>
      <Tag onClick={() => setIsOpen(true)} className="ms-3 cp" color="green" icon={<AimOutlined />}>
        Allocate
      </Tag>
      <ModalCmp confirmLoading={isLoadingAllocateCredits} onOk={onSubmit} onCancel={() => setIsOpen(false)} width={900} open={isOpen} title="Allocate leave credits">
        <Table
          size="small"
          loading={isLoadingStaffCredits}
          // bordered
          columns={columns}
          dataSource={dataSource}
          pagination={false}
        />
      </ModalCmp>
    </>
  );
}
