import { Breadcrumb } from "antd";
import { CardCmp } from "src/components/layouts/container";
import FormWithHook from "src/components/layouts/form";
import { LoaderWithChildren } from "src/components/styled";
import ExamScheduleTab from "./tabs";
import useCreate from "./useCreate";

export default function ExamScheduleDetail() {
  const { control, form_data, record_id, Modal, handleSubmit, navigate, isLoading, onSubmit, exam_timetable } = useCreate();
  return (
    <div>
      <Breadcrumb className="ms-3 mb-2 f1" items={[{ title: "Exam schedules", onClick: () => navigate(-1) }, { title: record_id ? "Update" : "Create" }]} />
      <LoaderWithChildren isLoading={isLoading}>
        <form onSubmit={handleSubmit}>
          <CardCmp title="Exam Schedule" className="mt-2">
            <FormWithHook is_edit={false} className="col-lg-6" control={control} data={form_data} />
            <ExamScheduleTab exam_timetable={exam_timetable} exam_timetable_id={record_id} />
          </CardCmp>
        </form>
      </LoaderWithChildren>
      <Modal description={record_id ? "Update Exam" : "Create Exam"} okButtonProps={{ onClick: onSubmit }} />
    </div>
  );
}
