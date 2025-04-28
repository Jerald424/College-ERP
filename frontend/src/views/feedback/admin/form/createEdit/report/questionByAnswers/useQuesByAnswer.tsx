import { useQuery } from "@tanstack/react-query";
import { Tag } from "antd";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { formData } from "src/components/layouts/form";

const getAnswer = async ({ form_id, question_id }) => {
  if ([form_id, question_id].some((res) => !res)) return {};
  const response = await axiosInstance.get(`api/feedback/question-answer/${form_id}/${question_id}`);
  return response;
};

export default function useQuestionAnswers() {
  const { question_id, form_id } = useParams();
  const { control, reset } = useForm();

  const { data, isPending } = useQuery({ queryKey: ["get/answer", form_id, question_id], queryFn: () => getAnswer({ form_id, question_id }) });

  let form_data = useMemo(() => {
    let arr: formData = [
      {
        label: "Name",
        name: "name",
        type: "input_box",
        rules: { required: "Name is required" },
        inputProps: { autoFocus: true },
        inputsContainerProps: { className: "f2" },
        conProps: { className: "df" },
        labelProps: { className: "f1" },
      },
      {
        label: "type",
        name: "type",
        type: "input_box",
        rules: { required: "Name is required" },
        inputProps: { autoFocus: true },
        inputsContainerProps: { className: "f2" },
        conProps: { className: "df" },
        labelProps: { className: "f1" },
      },
    ];
    if (["dropdown-single", "dropdown-multiple"].includes(data?.response?.question?.type?.id))
      arr.push({
        label: "Options",
        name: "options",
        type: "input_box",
        rules: { required: "Name is required" },
        inputProps: { autoFocus: true },
        inputsContainerProps: { className: "f2" },
        conProps: { className: "df" },
        labelProps: { className: "f1" },
      });
    return arr;
  }, [data]);

  const loadQuestion = () => {
    reset((prev) => ({
      ...prev,
      name: data?.response?.question?.name,
      type: data?.response?.question?.type?.value,
      options: data?.response?.question?.question_options?.map((res) => (
        <Tag color="blue" key={res?.id}>
          {res?.name}
        </Tag>
      )),
    }));
  };
  useEffect(() => {
    if (data) loadQuestion();
  }, [data]);

  return { data, isPending, form_data, control, form_id };
}
