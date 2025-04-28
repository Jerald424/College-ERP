import { DividerCmp } from "src/components/layouts/container";
import FormWithHook from "src/components/layouts/form";
import { Para } from "src/components/styled";
import useQuestions from "./useQuestions";

export default function Questions({ form, control, isEdit }) {
  const { form_data } = useQuestions({ form });
  return (
    <div>
      <DividerCmp className="my-2" />
      <Para className="fw-bold mb-3">Questions</Para>
      <FormWithHook is_edit={isEdit} className="grid-2" control={control} data={form_data} />
    </div>
  );
}
