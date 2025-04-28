import { LoaderWithChildren } from "src/components/styled";
import useStudentIndex from "./useStudentIndex";
import { CardCmp } from "src/components/layouts/container";
import FormWithHook from "src/components/layouts/form";

export default function Student() {
  const { control, form_data } = useStudentIndex();
  return (
    <div>
      <LoaderWithChildren isLoading={false}>
        <CardCmp title={`Profile`} className="mt-2">
          <FormWithHook is_edit={false} className="grid-2" control={control} data={form_data} />
        </CardCmp>
      </LoaderWithChildren>
    </div>
  );
}
