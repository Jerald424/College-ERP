import { useMemo } from "react";

export default function useQuestions({ form }) {
  let form_data = useMemo(() => {
    try {
      let type = {
        text: "input_box",
        "text-area": "input_box",
        "dropdown-single": "drop_down",
        "dropdown-multiple": "drop_down",
      };

      return form?.form_questions?.map((question) => {
        return {
          label: question?.name,
          name: `answer.${question?.id}`,
          type: type?.[question?.type],
          inputsContainerProps: { className: "f2" },
          conProps: { className: "df" },
          labelProps: { className: "f1" },
          dropdownProps: {
            options: question?.question_options,
            optional_label: "name",
            optional_value: "id",
            ...(question?.type == "dropdown-multiple" && { mode: "multiple" }),
          },
          inputProps: {
            ...(question?.type == "text-area" && { type: "textarea" }),
          },
        };
      });
    } catch (error) {
      console.error(error);
    }
  }, [form]);

  return { form_data };
}
