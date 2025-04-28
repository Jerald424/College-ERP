import { Breadcrumb } from "antd";
import { CardCmp } from "src/components/layouts/container";
import FormWithHook from "src/components/layouts/form";
import { LoaderWithChildren } from "src/components/styled";
import useCreate from "./useCreate";
import StudentTab from "./tabs";

export default function StudentDetailed({ is_student }: { is_student?: boolean }) {
  const { control, form_data, isLoading, student } = useCreate({ is_student });
  return (
    <div>
      {!is_student && <Breadcrumb className="ms-3 mb-2" items={[{ title: "Students", path: "/divider/student" }, { title: student?.applicant?.name }]} />}
      <LoaderWithChildren isLoading={isLoading}>
        <CardCmp title={`${student?.applicant?.name} (${student?.roll_no})`} className="mt-2">
          <FormWithHook is_edit={false} className="grid-2" control={control} data={form_data} />
          <StudentTab student={student} />
        </CardCmp>
      </LoaderWithChildren>
    </div>
  );
}
