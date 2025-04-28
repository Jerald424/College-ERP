import { useMutation, useQuery } from "@tanstack/react-query";
import { message } from "antd";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { formData } from "src/components/layouts/form";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";
import { getTerms } from "src/views/schedule/admin/calender/eventCreate/useEventCreate";

const createEdit = async ({ exam_config }: { exam_config: any }) => {
  let url = exam_config?.id ? `api/exam/exam-config/${exam_config?.id}` : "api/exam/exam-config";
  let method = exam_config?.id ? "put" : "post";
  const response = await axiosInstance[method](url, { exam_config });
  return response;
};

export const getExamConfigWithId = async ({ id }: { id: number }) => {
  if (!id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get(`api/exam/exam-config/${id}`);
  return response?.response;
};

export default function useCreate() {
  const { control, handleSubmit, reset, getValues, watch } = useForm({ mode: "all" });
  const [search, setSearch] = useSearchParams();
  const { Modal, setIsOpen } = useConfirmationModal();
  const navigate = useNavigate();
  let record_id = search.get("id");
  const [isEdit, setIsEdit] = useState(false);

  const { mutate: getProgrammeMutate, isPending: isLoadingProgramme } = useMutation({ mutationKey: ["get/exam-config"], mutationFn: getExamConfigWithId });
  const { mutate, isPending } = useMutation({ mutationKey: ["create/exam-config"], mutationFn: createEdit });
  const { data: terms, isLoading: isLoadingTerms } = useQuery({ queryKey: ["get/terms"], queryFn: getTerms });

  let [internal, external] = watch(["internal", "external"]);

  let form_data: formData = [
    {
      label: "Name",
      name: "name",
      type: "input_box",
      rules: { required: "Name is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df" },
      labelProps: { className: "f1" },
      inputProps: { autoFocus: true },
    },
    {
      label: "Internal Mark",
      name: "internal",
      type: "input_box",
      rules: { required: "Internal is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df " },
      labelProps: { className: "f1" },
      inputProps: {
        type: "number",
      },
    },
    {
      label: "External Mark",
      name: "external",
      type: "input_box",
      rules: { required: "External is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df " },
      labelProps: { className: "f1" },
      inputProps: {
        type: "number",
      },
    },

    {
      label: "Internal Pass Mark",
      name: "internal_pass_mark",
      type: "input_box",
      rules: {
        required: "Internal pass mark is required",
        validate: (val) => (+val > internal ? "Internal pass mark should be less then internal" : true),
      },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df " },
      labelProps: { className: "f1" },
      inputProps: {
        type: "number",
      },
    },
    {
      label: "External Pass Mark",
      name: "external_pass_mark",
      type: "input_box",
      rules: {
        required: "External pass mark is required",
        validate: (val) => (+val > external ? "Internal pass mark should be less then internal" : true),
      },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df " },
      labelProps: { className: "f1" },
      inputProps: {
        type: "number",
      },
    },
    {
      label: "Is Active",
      name: "is_active",
      type: "boolean",
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df " },
      labelProps: { className: "f1" },
    },
    {
      label: "Term",
      name: "term_id",
      type: "drop_down",
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df " },
      labelProps: { className: "f1" },
      rules: { required: "Term is required" },
      dropdownProps: {
        options: terms?.rows,
        optional_label: "name",
        optional_value: "id",
        loading: isLoadingTerms,
      },
    },
  ];

  const onSubmit = () => {
    try {
      setIsOpen(false);
      let exam_config = getValues();
      mutate(
        { exam_config },
        {
          onError: (error) => {
            message.error(error?.error);
          },
          onSuccess: (success) => {
            message.success(record_id ? "Exam config updated successfully" : "Exam config created successfully");
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
    if (record_id)
      getProgrammeMutate(
        { id: record_id },
        {
          onSuccess: (data) => {
            reset({
              ...data,
              internal_pass_mark: String(data?.internal_pass_mark),
              internal: String(data?.internal),
              external_pass_mark: String(data?.external_pass_mark),
              external: String(data?.external),
            });
          },
        }
      );
  }, [record_id]);

  return {
    control,
    form_data,
    record_id,
    handleSubmit: handleSubmit(() => setIsOpen(true)),
    Modal,
    navigate,
    isLoading: isPending || isLoadingProgramme,
    onSubmit,
    isEdit,
    setIsEdit,
  };
}
