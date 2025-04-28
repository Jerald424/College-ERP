import FormWithHook, { controlInter, formData, setValueInter } from "src/components/layouts/form";

export default function PersonalFields({ control, support_data, setValue }: { control: controlInter; support_data: any; setValue: setValueInter }) {
  let form_data: formData = [
    { label: "Address", name: "address", type: "input_box", rules: { required: "Address is required" }, inputProps: { type: "textarea" } },
    {
      label: "State",
      name: "state_id",
      type: "drop_down",
      rules: { required: "State is required" },
      dropdownProps: { options: support_data?.["state"], optional_label: "name", optional_value: "id", onChange: () => setValue("district_id", null) },
    },
    {
      label: "District",
      name: "district_id",
      type: "drop_down",
      rules: { required: "District is required" },
      dropdownProps: { options: support_data?.["district"], optional_label: "name", optional_value: "id" },
    },
  ];

  return <FormWithHook className="grid-3" control={control} data={form_data} />;
}
