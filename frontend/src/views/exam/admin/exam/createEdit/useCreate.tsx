import { useMutation, useQuery } from "@tanstack/react-query";
import { message } from "antd";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { formData } from "src/components/layouts/form";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";
import { getClass } from "src/views/schedule/admin/timetable/useTimetableView";

const createEdit = async ({ exam }: { exam: any }) => {
  let url = exam?.id ? `api/exam/exam/${exam?.id}` : "api/exam/exam";
  let method = exam?.id ? "put" : "post";
  const response = await axiosInstance[method](url, { exam });
  return response;
};

const getRecord = async ({ id }: { id: number }) => {
  if (!id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get(`api/exam/exam/${id}`);
  return response?.response;
};

const getExamCreateSupportData = async () => {
  const response = await axiosInstance.get("api/exam/exam-create-support-data");
  return response?.response;
};

const getScheduleCount = async ({ exam_id }) => {
  if (!exam_id) return {};
  const response = await axiosInstance.get(`api/exam/schedules-count/${exam_id}`);
  return response?.response;
};

export default function useCreate() {
  const { control, handleSubmit, reset, getValues, watch } = useForm({ mode: "all" });
  const [search, setSearch] = useSearchParams();
  const { Modal, setIsOpen } = useConfirmationModal();
  const navigate = useNavigate();
  let record_id = search.get("id");
  const [isEdit, setIsEdit] = useState(false);

  const { mutate: getProgrammeMutate, isPending: isLoadingProgramme } = useMutation({ mutationKey: ["get/exam"], mutationFn: getRecord });
  const { mutate, isPending } = useMutation({ mutationKey: ["create/exam"], mutationFn: createEdit });
  const { data: support_data, isLoading: isLoadingSupportData } = useQuery({ queryKey: ["get/exam-create-support-date"], queryFn: getExamCreateSupportData });
  const { data: schedule_count, isLoading: isLoadingScheduleCount } = useQuery({ queryKey: ["get/schedule-count", record_id], queryFn: () => getScheduleCount({ exam_id: record_id }) });

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
      label: "Type",
      name: "type",
      type: "drop_down",
      rules: { required: "Type is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
      dropdownProps: {
        options: support_data?.type,
        optional_label: "value",
        optional_value: "id",
        loading: isLoadingSupportData,
      },
    },
    // {
    //   label: "Classes",
    //   name: "class_ids",
    //   type: "drop_down",
    //   rules: { required: "Classes is required" },
    //   inputsContainerProps: { className: "f2" },
    //   conProps: { className: "df mt-1" },
    //   labelProps: { className: "f1" },
    //   dropdownProps: {
    //     options: classes?.rows,
    //     optional_label: "name",
    //     optional_value: "id",
    //     loading: isLoadingClass,
    //     mode: "multiple",
    //   },
    //   is_tag: true,
    // },
    {
      label: "Exam config",
      name: "exam_config_id",
      type: "drop_down",
      rules: { required: "Exam config is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
      dropdownProps: {
        options: support_data?.exam_config,
        optional_label: "name",
        optional_value: "id",
        loading: isLoadingSupportData,
      },
    },
    {
      label: "Active",
      name: "is_active",
      type: "boolean",
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
    },
  ];

  const onSubmit = () => {
    try {
      setIsOpen(false);
      let exam = getValues();
      mutate(
        { exam },
        {
          onError: (error) => {
            message.error(error?.error);
          },
          onSuccess: (success) => {
            message.success(record_id ? "Exam updated successfully" : "Exam created successfully");
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
            console.log("data: ", data);
            reset({
              ...data,
              class_ids: data?.classes?.map((res) => res?.id),
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
    isLoadingScheduleCount,
    schedule_count,
  };
}
