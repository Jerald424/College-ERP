import { useMemo } from "react";
import FormWithHook, { controlInter, formData } from "src/components/layouts/form";
import { ImageUploadCmp } from "src/components/styled";
import { useBase } from "src/redux/hooks";

export default function BasicFields({ control, support_data, applicant_data }: { control: controlInter; support_data: any; applicant_data: any }) {
  const {
    user: { login },
  } = useBase();

  let is_disable_basic = useMemo(() => login && applicant_data?.status !== "draft", [login, applicant_data]);

  let form_data: formData = [
    { label: "Name", name: "name", type: "input_box", rules: { required: "Name is required" } },
    { label: "Email", name: "email", type: "input_box", rules: { required: "Email is required" } },
    {
      label: "Gender",
      name: "gender",
      type: "drop_down",
      rules: { required: "Gender is required" },
      dropdownProps: { options: support_data?.["gender"], optional_label: "value", optional_value: "id" },
    },
    {
      label: "Mobile",
      name: "mobile",
      type: "input_box",
      rules: { required: "Mobile is required" },
    },
    {
      label: "Programme Level",
      name: "programme_level",
      type: "drop_down",
      rules: { required: "Programme level is required" },
      dropdownProps: { options: support_data?.["programme_level"], optional_label: "value", optional_value: "id", disabled: is_disable_basic },
    },
    {
      label: "Programme",
      name: "programme_id",
      type: "drop_down",
      rules: { required: "Programme is required" },
      dropdownProps: { options: support_data?.["programme"], optional_label: "name", optional_value: "id", disabled: is_disable_basic },
    },
  ];

  return (
    <div className="row">
      <FormWithHook className="grid-2 col-lg-10" control={control} data={form_data} />
      <div className="col-lg-2 daj">
        <ImageUploadCmp name="image" control={control} />
      </div>
    </div>
  );
}
