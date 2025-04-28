import { useMutation, useQuery } from "@tanstack/react-query";
import { message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useSearchParams } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { formData } from "src/components/layouts/form";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import isEmpty from "lodash/isEmpty";

const getForm = async ({ id }) => {
  const response = await axiosInstance.get(`api/feedback/form/${id}`);
  return response?.response;
};

const updateAnswer = async ({ answer }) => {
  const response = await axiosInstance.post("api/feedback/answer-feedback", { answer });
  return response;
};

const getAnswer = async ({ form_id, user_id }) => {
  if (!form_id) return {};
  let url = `api/feedback/user-feedback-answer/${form_id}`;
  if (user_id) url += `?user_id=${user_id}`;
  const response = await axiosInstance.get(url);
  return response;
};

export default function useDetail() {
  const { control, reset, handleSubmit, getValues, setValue } = useForm();
  const { id } = useParams();
  const [isEdit, setIsEdit] = useState(false);
  const { Modal, setIsOpen } = useConfirmationModal();
  const [search] = useSearchParams();

  const { data: form, isLoading } = useQuery({ queryKey: ["get/form", id], queryFn: () => getForm({ id }) });
  const { mutate: updateAnswerMutate, isPending: isLoadingAnswerUpdate } = useMutation({ mutationKey: ["update/answer"], mutationFn: updateAnswer });
  const { mutate: getAnswerMutate, isPending: isLoadingAnswer, data: feedback_answer } = useMutation({ mutationKey: ["get/answer"], mutationFn: getAnswer });

  let user_id = search.get("user_id");

  let form_data: formData = [
    {
      label: "Name",
      name: "name",
      type: "input_box",
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df" },
      labelProps: { className: "f1" },
    },
    {
      label: "Date",
      name: "date",
      type: "date_picker",
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df" },
      labelProps: { className: "f1" },
      datePickerProps: {
        date_picker_type: "date_range",
        showTime: true,
      },
    },
  ];

  let form_status = useMemo(() => {
    try {
      let [start_date, end_date] = [form?.start_date, form?.end_date];
      let today = new Date();
      if (new Date(start_date) > today) return { is_edit: false, status: "Not yet start", color: "red" };
      else if (new Date(end_date) < today) return { is_edit: false, status: "Finished", color: "green" };
      else return { is_edit: true, status: "In progress", color: "gold" };
    } catch (error) {
      console.error(error);
    }
  }, [form]);

  let question_by_id = useMemo(() => {
    try {
      return form?.form_questions?.reduce((acc, cur) => {
        acc[cur?.id] = cur;
        return acc;
      }, {});
    } catch (error) {
      console.error(error);
    }
  }, [form]);

  let prev_answer_by_id = useMemo(() => {
    try {
      return feedback_answer?.response?.reduce((acc, cur) => {
        acc[cur?.question_id] = cur?.id;
        return acc;
      }, {});
    } catch (error) {
      console.error(error);
    }
  }, [feedback_answer]);

  const loadValue = () => {
    try {
      reset((prev) => ({
        ...prev,
        ...form,
        date: [form?.start_date, form?.end_date],
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const onConfirmSave = () => {
    try {
      let data = getValues();
      setIsOpen(false);
      let answer = {
        form_id: form?.id,
        data: Object.entries(data?.answer)?.map(([question_id, value]) => {
          let obj = {
            question_id: +question_id,
          };
          let prev_id = prev_answer_by_id?.[question_id];
          if (prev_id) obj["id"] = prev_id;
          let ques = question_by_id?.[question_id];
          if (["text", "text-area"].includes(ques?.type)) obj["text_answer"] = value;
          else if (ques?.type == "dropdown-single") obj["options_ids"] = [value];
          else obj["options_ids"] = value;
          return obj;
        }),
      };

      updateAnswerMutate(
        { answer },
        {
          onSuccess(success) {
            setIsEdit(false);

            message.success("Feedback updated successfully");
          },
          onError(error) {
            console.log("error: ", error);
            message.error(error?.error);
          },
          onSettled() {
            getAnswerMutate({ form_id: form?.id });
          },
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  const loadPrevAnswer = () => {
    try {
      let answer = feedback_answer?.response?.reduce((acc, cur) => {
        let ques = question_by_id?.[cur?.question_id];
        if (["text", "text-area"].includes(ques?.type)) acc[cur?.question_id] = cur?.text_answer;
        else if (ques?.type == "dropdown-single") acc[cur?.question_id] = cur?.options?.[0]?.id;
        else acc[cur?.question_id] = cur?.options?.map((res) => res?.id);
        return acc;
      }, {});
      setValue("answer", answer);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if ([feedback_answer, question_by_id].every((res) => !isEmpty(res))) loadPrevAnswer();
  }, [feedback_answer, question_by_id]);

  useEffect(() => {
    if (form) {
      loadValue();
      getAnswerMutate({ form_id: form?.id, user_id });
    }
  }, [form]);

  return {
    form,
    form_data,
    control,
    form_status,
    isLoading,
    isEdit,
    setIsEdit,
    onSubmit: handleSubmit(() => setIsOpen(true)),
    Modal,
    onConfirmSave,
    isLoadingAnswerUpdate,
    isLoadingAnswer,
    user_id,
  };
}
