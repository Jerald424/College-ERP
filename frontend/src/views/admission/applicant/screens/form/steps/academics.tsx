import FormWithHook, { controlInter, formData } from "src/components/layouts/form";

export default function AcademicsFields({ control }: { control: controlInter }) {
  let form_data: formData = [
    { label: "10th Marksheet", name: "10th_marksheet", type: "input_box", rules: { required: "10th Marksheet is required" }, inputProps: { type: "file" } },
    { label: "12th Marksheet", name: "12th_marksheet", type: "input_box", rules: { required: "12th Marksheet is required" }, inputProps: { type: "file" } },
    { label: "12th Mark", name: "12th_mark", type: "input_box", rules: { required: "12th Mark is required" }, inputProps: { type: "number" } },
    { label: "10th Mark", name: "10th_mark", type: "input_box", rules: { required: "10th Mark is required" }, inputProps: { type: "number" } },
  ];
  return (
    <>
      <FormWithHook className="grid-3" control={control} data={form_data} />
    </>
  );
}
