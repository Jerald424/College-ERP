import { CloseCircleFilled, EditFilled, LoadingOutlined, SaveFilled } from "@ant-design/icons";
import { Table, Tag } from "antd";
import useMarkEntry from "./useMarkEntry";

export default function ExamMarkEntry({ students, isLoadingStudents, exam_timetable }) {
  const { columns, dataSource, marks_obj, Modal, setIsOpen, handleSave, isLoadingUpdateMark, isEdit, setIsEdit, getMarkFn, isLoadingExamMark } = useMarkEntry({ students, exam_timetable });
  return (
    <div>
      <div className="d-flex flex-wrap align-items-center">
        <div className="f1">
          <Tag color="cyan">Max: {marks_obj?.max}</Tag>
          <Tag color="gold">Pass: {marks_obj?.pass}</Tag>
          <Tag color="blue">Enter 0 if absent</Tag>
          <Tag color="volcano">Make sure to save your work</Tag>
        </div>
        {isLoadingExamMark && (
          <Tag color="purple-inverse" icon={<LoadingOutlined />}>
            Loading
          </Tag>
        )}
        {isEdit ? (
          <>
            <Tag
              onClick={() => {
                setIsEdit(false);
                getMarkFn();
              }}
              className="cp"
              color="red"
              icon={<CloseCircleFilled />}
            >
              Discard
            </Tag>
            <Tag icon={isLoadingUpdateMark ? <LoadingOutlined /> : <SaveFilled />} color="green" className="cp" onClick={() => setIsOpen(true)}>
              Save
            </Tag>
          </>
        ) : (
          <Tag onClick={() => setIsEdit(true)} className="cp" color="blue" icon={<EditFilled />}>
            Edit
          </Tag>
        )}
      </div>
      <div className="mt-2" />
      <Table
        size="small"
        loading={isLoadingStudents}
        // bordered
        columns={columns}
        dataSource={dataSource}
        pagination={false}
      />

      <Modal description="Save mark" okButtonProps={{ onClick: () => handleSave() }} cancelButtonProps={{ onClick: () => setIsOpen(false) }} />
    </div>
  );
}
