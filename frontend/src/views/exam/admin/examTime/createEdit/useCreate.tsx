import { useMutation, useQuery } from "@tanstack/react-query";
import { message } from "antd";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { formData } from "src/components/layouts/form";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import { makeJSDateToYYYYMMDD } from "src/functions/handleDate";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";
import { getClass } from "src/views/schedule/admin/timetable/useTimetableView";

const createEdit = async ({ exam_time }: { exam_time: any }) => {
  let url = exam_time?.id ? `api/exam/exam-time/${exam_time?.id}` : "api/exam/exam-time";
  let method = exam_time?.id ? "put" : "post";
  const response = await axiosInstance[method](url, { exam_time });
  return response;
};

const getRecord = async ({ id }: { id: number }) => {
  if (!id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get(`api/exam/exam-time/${id}`);
  return response?.response;
};

export default function useCreate() {
  const { control, handleSubmit, reset, getValues, watch } = useForm({ mode: "all" });
  const [search, setSearch] = useSearchParams();
  const { Modal, setIsOpen } = useConfirmationModal();
  const navigate = useNavigate();
  let record_id = search.get("id");
  const [isEdit, setIsEdit] = useState(false);

  const { mutate: getProgrammeMutate, isPending: isLoadingProgramme } = useMutation({ mutationKey: ["get/exam-time"], mutationFn: getRecord });
  const { mutate, isPending } = useMutation({ mutationKey: ["create/exam-time"], mutationFn: createEdit });

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
      label: "Time",
      name: "time",
      type: "time_picker",
      rules: { required: "Time is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
      timePickerProps: {
        time_picker_type: "time_range_picker",
      },
    },
  ];

  const onSubmit = () => {
    try {
      setIsOpen(false);
      let exam_time = getValues();
      [exam_time["time_from"], exam_time["time_to"]] = exam_time?.time;
      mutate(
        { exam_time },
        {
          onError: (error) => {
            message.error(error?.error);
          },
          onSuccess: (success) => {
            message.success(record_id ? "Exam time updated successfully" : "Exam time created successfully");
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
              time: [data?.time_from, data?.time_to],
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
