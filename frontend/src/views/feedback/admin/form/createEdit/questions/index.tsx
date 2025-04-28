import { Table, Tabs, TabsProps } from "antd";
import useQuestions from "./useQuestions";
import { ButtonCmp, CheckBoxCmp, ModalCmp } from "src/components/styled";
import { useMemo, useState } from "react";

export default function FormQuestions({ setValue, watch, reset, is_edit, data }) {
  const items: TabsProps["items"] = [
    {
      key: "questions",
      label: "Questions",
      children: <Questions data={data} is_edit={is_edit} setValue={setValue} watch={watch} reset={reset} />,
    },
  ];

  return (
    <>
      <Tabs defaultActiveKey="questions" items={items} />
    </>
  );
}

const Questions = ({ setValue, watch, reset, is_edit, data }) => {
  const { isLoadingQuestion, un_selected_questions, columns, selected_questions } = useQuestions({ watch, reset, is_edit, data });

  return (
    <>
      <Table size="small" loading={isLoadingQuestion} dataSource={selected_questions} columns={columns} />
      {is_edit && <AddQuestionModal reset={reset} setValue={setValue} un_selected_questions={un_selected_questions} />}
    </>
  );
};

const AddQuestionModal = ({ un_selected_questions, setValue, reset }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState([]);

  let columns = [
    {
      dataIndex: "s.no",
      title: "#",
    },
    {
      dataIndex: "name",
      title: "Name",
    },
    {
      dataIndex: "type",
      title: "Type",
    },
  ];

  let dataSource = useMemo(() => {
    try {
      return un_selected_questions?.map((res, index) => ({
        ...res,
        "s.no": (
          <div>
            <CheckBoxCmp checked={selected?.includes(res?.id)} /> &nbsp;&nbsp;&nbsp;
            {index + 1}
          </div>
        ),
        type: res?.type?.value,
      }));
    } catch (error) {
      console.error(error);
    }
  }, [un_selected_questions, selected]);

  const handleSelect = ({ id }) => {
    try {
      setSelected((prev) => {
        let tmp = [...prev];
        let index = tmp?.indexOf?.(id);
        if (index == -1) tmp?.push(id);
        else tmp?.splice(index, 1);
        return tmp;
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = () => {
    try {
      reset((prev) => {
        let tmp = { ...prev };
        if (!tmp?.["question_ids"]) tmp["question_ids"] = [];
        tmp["question_ids"] = tmp?.["question_ids"]?.concat(selected);
        return tmp;
      });
      setSelected([]);
      setIsOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <ButtonCmp onClick={() => setIsOpen(true)} type="text" className="mt-3">
        + Add a question
      </ButtonCmp>
      <ModalCmp centered onCancel={() => setIsOpen(false)} footer={null} open={isOpen} title="Add a question">
        <Table
          size="small"
          onRow={(item) => {
            return {
              className: "cp",
              onClick: () => handleSelect({ id: item?.id }),
            };
          }}
          scroll={{ y: 400 }}
          dataSource={dataSource}
          columns={columns}
        />
        <div className="ae">
          <ButtonCmp onClick={handleSave}>Save</ButtonCmp>
        </div>
      </ModalCmp>
    </>
  );
};
