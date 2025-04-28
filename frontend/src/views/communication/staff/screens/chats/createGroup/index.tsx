import { Collapse, Tag } from "antd";
import { isEmpty } from "lodash";
import { useMemo } from "react";
import { DividerCmp } from "src/components/layouts/container";
import { ButtonCmp, CheckBoxCmp, FlatList, Icon, InputBox, LoaderCmp, Para } from "src/components/styled";
import useCreateGroup from "./useCreateGroup";

export default function CreateGroup({ already_in_group, handleAdd }) {
  const { class_by_student, isLoading, selectedStudent, setSelectedStudent, Modal, onConfirmCreate, setIsOpen, groupName, setGroupName } = useCreateGroup({ already_in_group, handleAdd });

  if (isLoading)
    return (
      <div className="text-center my-3">
        <LoaderCmp />
      </div>
    );
  return (
    <>
      <div className="df flex-column px-3">
        <div className="f1">
          {class_by_student && Object.entries(class_by_student)?.map((cls) => <SepClass selectedStudent={selectedStudent} setSelectedStudent={setSelectedStudent} key={cls?.[0]} cls={cls} />)}
        </div>

        {already_in_group ? (
          <div className="ae f1">
            <ButtonCmp onClick={onConfirmCreate} icon={<Icon className="fa fa-add" />}>
              Add
            </ButtonCmp>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e?.preventDefault();
              setIsOpen(true);
            }}
            className="df my-3"
          >
            <InputBox onChange={(e) => setGroupName(e?.target?.value)} className="f1" placeholder="Group Name" />
            <ButtonCmp disabled={!groupName || Object.values(selectedStudent)?.every(isEmpty)} htmlType="submit">
              Create
            </ButtonCmp>
          </form>
        )}
      </div>
      <Modal description="To create group" okButtonProps={{ onClick: onConfirmCreate }} />
    </>
  );
}

const SepClass = ({ cls, selectedStudent, setSelectedStudent }) => {
  let cls_obj = useMemo(() => {
    try {
      return JSON.parse(cls?.[0]);
    } catch (error) {
      console.error(error);
    }
  }, [cls]);

  let cls_checked = useMemo(() => {
    try {
      let cur_cls = cls?.[1];
      if (!isEmpty(cur_cls)) return cur_cls?.length == selectedStudent?.[cls_obj?.id]?.length;
    } catch (error) {
      console.error(error);
    }
  }, [cls, selectedStudent]);

  const handleSelectCls = () => {
    if (cls_checked) setSelectedStudent((prev) => ({ ...prev, [cls_obj?.id]: [] }));
    else
      setSelectedStudent((prev) => {
        let tmp = { ...prev };

        if (!tmp[cls_obj?.id]) tmp[cls_obj?.id] = [];
        tmp[cls_obj?.id]?.push(...cls?.[1]?.map((std) => std?.user?.id));
        return tmp;
      });
  };

  let items = [
    {
      key: cls_obj?.id,
      label: (
        <div>
          <CheckBoxCmp checked={cls_checked} onChange={handleSelectCls} /> &nbsp;
          <Tag>{cls_obj?.name}</Tag>
        </div>
      ),
      children: (
        <FlatList
          className="mt-3"
          data={cls?.[1]}
          renderItem={(student) => <SepStudent cls_obj={cls_obj} selectedStudent={selectedStudent?.[cls_obj?.id]} setSelectedStudent={setSelectedStudent} key={student?.id} student={student} />}
        />
      ),
    },
  ];

  return (
    <div>
      <Collapse style={{ backgroundColor: "inherit" }} size="small" bordered={false} items={items} />
      <DividerCmp className="my-2" />
    </div>
  );
};

const SepStudent = ({ student, selectedStudent, setSelectedStudent, cls_obj }) => {
  const handleSelect = () => {
    try {
      setSelectedStudent((prev) => {
        let tmp = { ...prev };
        if (!tmp?.[cls_obj?.id]) tmp[cls_obj?.id] = [];
        let index = tmp[cls_obj?.id]?.indexOf(student?.user?.id);
        if (index != -1) tmp?.[cls_obj?.id]?.splice(index, 1);
        else tmp?.[cls_obj?.id]?.push(student?.user?.id);
        // return { a: 10 };
        return tmp;
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="dajc my-3 cp" onClick={handleSelect}>
      <CheckBoxCmp checked={selectedStudent?.includes(student?.user?.id)} />
      <img style={{ height: 50, width: 50, borderRadius: 50, objectFit: "cover" }} src={student?.applicant?.image} className="mx-3" />
      <div className="f1">
        <Para>{student?.applicant?.name}</Para>
      </div>
    </div>
  );
};
