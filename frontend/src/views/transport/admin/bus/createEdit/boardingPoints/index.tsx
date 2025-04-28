import { DividerCmp } from "src/components/layouts/container";
import { ButtonCmp, InputBox, ModalCmp, Para, SubHeading } from "src/components/styled";
import SequenceTable from "src/components/styled/table/sequenceTable";
import useBoardingPoints from "./useBoardingPoints";

export default function BoardingPoints({ isEdit, reset, boarding_points_value, refetchBoardingPoint, isLoadingBoardingPoint }) {
  const { columns, dataSource, selected, setSelected, isOpen, setIsOpen, handleSave, isLoadingBoardingPointDelete } = useBoardingPoints({ reset, boarding_points_value, refetchBoardingPoint, isEdit });

  return (
    <>
      <DividerCmp className="my-2" />
      <Para className="fw-bold">Boarding Points</Para>
      <SequenceTable
        loading={isLoadingBoardingPoint || isLoadingBoardingPointDelete}
        size="small"
        // bordered
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        url="api/transport/boarding-point-sequence"
      />
      {isEdit && (
        <ButtonCmp
          className="mt-2"
          onClick={() => {
            setIsOpen("add");
            setSelected({ id: Date.now(), static: true });
          }}
        >
          Add a item
        </ButtonCmp>
      )}
      <ModalCmp open={!!isOpen} onCancel={() => setIsOpen(false)} footer={null} title={selected?.id ? "Update boarding point" : "Add boarding point"}>
        <div className="df">
          <InputBox className="f1" value={selected?.name} onChange={(e) => setSelected((prev) => ({ ...prev, name: e?.target?.value }))} placeholder="Enter boarding point name" />
          <ButtonCmp onClick={handleSave}>Save</ButtonCmp>
        </div>
      </ModalCmp>
    </>
  );
}
