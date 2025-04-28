import { useMutation, useQuery } from "@tanstack/react-query";
import { message } from "antd";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { formData } from "src/components/layouts/form";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";

const createEdit = async ({ course }: { course: any }) => {
  let url = course?.id ? `api/course/course/${course?.id}` : "api/course/course";
  let method = course?.id ? "put" : "post";
  const response = await axiosInstance[method](url, { course });
  return response;
};

const getRecord = async ({ id }: { id: number }) => {
  if (!id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get(`api/course/course/${id}`);
  return response?.response;
};

const getSupportData = async () => {
  const response = await axiosInstance.get(`api/course/course/support-data`);
  return response?.response;
};

export default function useCreate() {
  const { control, handleSubmit, reset, getValues } = useForm();
  const [search, setSearch] = useSearchParams();
  const { Modal, setIsOpen } = useConfirmationModal();
  const navigate = useNavigate();
  let record_id = search.get("id");
  const [isEdit, setIsEdit] = useState(false);

  const { mutate: getProgrammeMutate, isPending: isLoadingProgramme } = useMutation({ mutationKey: ["get/programme"], mutationFn: getRecord });
  const { mutate, isPending } = useMutation({ mutationKey: ["create/edit-user"], mutationFn: createEdit });
  const { data: support_data, isLoading: isLoadingSupportData } = useQuery({ queryKey: ["get/support-data"], queryFn: getSupportData });

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
      label: "Code",
      name: "code",
      type: "input_box",
      rules: { required: "Code is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
    },
    {
      label: "Terms",
      name: "term_ids",
      type: "drop_down",
      // rules: { required: "Terms is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
      dropdownProps: {
        loading: isLoadingSupportData,
        options: support_data?.["terms"],
        optional_label: "name",
        optional_value: "id",
        mode: "multiple",
      },
    },
    {
      label: "Classes",
      name: "class_ids",
      type: "drop_down",
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
      dropdownProps: {
        loading: isLoadingSupportData,
        options: support_data?.["classes"],
        optional_label: "name",
        optional_value: "id",
        mode: "multiple",
      },
      is_tag: true,
    },
    {
      label: "Staffs",
      name: "staff_ids",
      type: "drop_down",
      // rules: { required: "Terms is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
      dropdownProps: {
        loading: isLoadingSupportData,
        options: support_data?.["staffs"],
        optional_label: "name",
        optional_value: "id",
        mode: "multiple",
      },
    },
  ];

  const onSubmit = () => {
    try {
      setIsOpen(false);
      let course = getValues();
      mutate(
        { course },
        {
          onError: (error) => {
            message.error(error?.error);
          },
          onSuccess: (success) => {
            message.success(record_id ? "Course updated successfully" : "Course created successfully");
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
              term_ids: data?.terms?.map((res) => res?.id),
              class_ids: data?.classes?.map((res) => res?.id),
              staff_ids: data?.staffs?.map((res) => res?.id),
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
