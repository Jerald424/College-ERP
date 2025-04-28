import { Table, Tabs, TabsProps } from "antd";
import { ButtonCmp, InputBox, ModalCmp } from "src/components/styled";
import useQuestionOptions from "./useQuestionOptions";

export default function QuestionOptions({ watch, reset, isEdit }) {
  const items: TabsProps["items"] = [
    {
      key: "options",
      label: "Options",
      children: <Options reset={reset} watch={watch} isEdit={isEdit} />,
    },
  ];

  return (
    <>
      <Tabs defaultActiveKey="options" items={items} />
    </>
  );
}

const Options = ({ watch, reset, isEdit }) => {
  const { columns, setState, state, handleSave, dataSource } = useQuestionOptions({ watch, reset, isEdit });

  return (
    <>
      {isEdit && (
        <ButtonCmp onClick={() => setState({ id: `static_${Date.now()}` })} className="mb-2">
          Add a item
        </ButtonCmp>
      )}
      <Table bordered size="small" columns={columns} dataSource={dataSource} />
      <ModalCmp footer={null} onCancel={() => setState(false)} open={!!state} title={state?.id?.includes?.("static") ? "Create Option" : "Update Option"}>
        <InputBox placeholder="Name" value={state?.name} onChange={(e) => setState((prev) => ({ ...prev, name: e?.target?.value }))} />
        <div className="mt-3 ae">
          <ButtonCmp onClick={() => setState(false)} className="me-3" type="text">
            Discard
          </ButtonCmp>
          <ButtonCmp disabled={!state?.name} onClick={handleSave}>
            Save
          </ButtonCmp>
        </div>
      </ModalCmp>
    </>
  );
};
