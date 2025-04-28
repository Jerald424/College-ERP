import { useMutation, useQuery } from "@tanstack/react-query";
import { message } from "antd";
import { identity, includes } from "lodash";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { formData } from "src/components/layouts/form";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";

const createEdit = async ({ question }: { question: any }) => {
  let url = question?.id ? `api/feedback/question/${question?.id}` : "api/feedback/question";
  let method = question?.id ? "put" : "post";
  const response = await axiosInstance[method](url, { question });
  return response;
};

const getRecord = async ({ id }: { id: number }) => {
  if (!id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get(`api/feedback/question/${id}`);
  return response?.response;
};

const createOptions = async ({ options }) => {
  const response = await axiosInstance.post("api/feedback/question-options", { options });
  return response;
};

const deleteOptions = async ({ ids }) => {
  let response = await axiosInstance.delete(`api/feedback/question-options/${ids}`);
  return response;
};

const getQuestionOptions = async ({ question_id }) => {
  if (!question_id) return {};
  let response = await axiosInstance.get(`api/feedback/question-options/${question_id}`);
  return response;
};

let question_type = [
  { id: "text", value: "Text" },
  { id: "text-area", value: "Textarea" },
  { id: "dropdown-single", value: "Dropdown Single" },
  { id: "dropdown-multiple", value: "Dropdown Multiple" },
];

export default function useCreate() {
  const { control, handleSubmit, reset, getValues, watch, setValue } = useForm();
  const [search, setSearch] = useSearchParams();
  const { Modal, setIsOpen } = useConfirmationModal();
  const navigate = useNavigate();
  let record_id = search.get("id");
  const [isEdit, setIsEdit] = useState(false);

  const { mutate: getProgrammeMutate, isPending: isLoadingProgramme, data } = useMutation({ mutationKey: ["get/programme"], mutationFn: getRecord });
  const { mutate, isPending } = useMutation({ mutationKey: ["create/edit-user"], mutationFn: createEdit });
  const { mutate: createOptionsMutate, isPending: isLoadingCreateOptions } = useMutation({ mutationKey: ["create/options"], mutationFn: createOptions });
  const { mutate: deleteOptionsMutate, isPending: isLoadingDeleteOptions } = useMutation({ mutationKey: ["delete/options"], mutationFn: deleteOptions });
  const { mutate: getQuestionOptionsMutate, isPending: isLoadingQuestionOptions } = useMutation({ mutationKey: ["get/options"], mutationFn: getQuestionOptions });

  let type = watch("type");

  let form_data: formData = [
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
      label: "Type",
      name: "type",
      type: "drop_down",
      rules: { required: "Code is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
      dropdownProps: {
        options: question_type,
        optional_label: "value",
        optional_value: "id",
      },
    },
  ];

  const fetchOptions = () => {
    getQuestionOptionsMutate(
      { question_id: record_id },
      {
        onSuccess: (data) => {
          let val = data?.response?.reduce((acc, cur) => {
            acc[cur?.id] = cur;
            return acc;
          }, {});
          setValue("option", val);
        },
      }
    );
  };

  const onSubmit = () => {
    try {
      setIsOpen(false);
      let question = getValues();

      if (record_id) {
        let options = question?.option;

        if (options)
          createOptionsMutate(
            {
              options: {
                data: Object.values(options)?.map((res) => {
                  let tmp = { ...res };
                  delete tmp["id"];
                  return tmp;
                }),
                question_id: +record_id,
              },
            },
            {
              onSettled() {
                fetchOptions();
              },
            }
          );
        let deleted = question?.deleted;
        if (deleted) deleteOptionsMutate({ ids: deleted?.join(",") });
      }
      mutate(
        { question },
        {
          onError: (error) => {
            message.error(error?.error);
          },
          onSuccess: (success) => {
            message.success(record_id ? "Question updated successfully" : "Question created successfully");
            let result = success?.response;
            setSearch({ id: result?.id });
            setIsEdit(false);
          },
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (record_id) {
      getProgrammeMutate(
        { id: record_id },
        {
          onSuccess: (data) => {
            reset({
              ...data,
            });
          },
        }
      );
      fetchOptions();
    }
  }, [record_id]);

  return {
    control,
    form_data,
    record_id,
    handleSubmit: handleSubmit(() => setIsOpen(true)),
    Modal,
    navigate,
    isLoading: isPending || isLoadingProgramme || isLoadingQuestionOptions || isLoadingDeleteOptions || isLoadingCreateOptions,
    onSubmit,
    isEdit,
    setIsEdit,
    data,
    watch,
    reset,
    type,
  };
}
