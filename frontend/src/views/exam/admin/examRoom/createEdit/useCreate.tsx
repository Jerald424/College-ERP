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

const createEdit = async ({ exam_room }: { exam_room: any }) => {
  let url = exam_room?.id ? `api/exam/exam-room/${exam_room?.id}` : "api/exam/exam-room";
  let method = exam_room?.id ? "put" : "post";
  const response = await axiosInstance[method](url, { exam_room });
  return response;
};

const getRecord = async ({ id }: { id: number }) => {
  if (!id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get(`api/exam/exam-room/${id}`);
  return response?.response;
};

export default function useCreate() {
  const { control, handleSubmit, reset, getValues, watch } = useForm({ mode: "all" });
  const [search, setSearch] = useSearchParams();
  const { Modal, setIsOpen } = useConfirmationModal();
  const navigate = useNavigate();
  let record_id = search.get("id");
  const [isEdit, setIsEdit] = useState(false);

  let [row, column] = watch(["row", "column"]);

  const { mutate: getProgrammeMutate, isPending: isLoadingProgramme } = useMutation({ mutationKey: ["get/exam-room"], mutationFn: getRecord });
  const { mutate, isPending } = useMutation({ mutationKey: ["create/exam-room"], mutationFn: createEdit });

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
      label: "Row",
      name: "row",
      type: "input_box",
      rules: { required: "Row is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
      inputProps: {
        type: "number",
      },
    },
    {
      label: "Column",
      name: "column",
      type: "input_box",
      rules: { required: "Columns is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
      inputProps: {
        type: "number",
      },
    },
  ];

  const onSubmit = () => {
    try {
      setIsOpen(false);
      let exam_room = getValues();
      mutate(
        { exam_room },
        {
          onError: (error) => {
            message.error(error?.error);
          },
          onSuccess: (success) => {
            message.success(record_id ? "Exam room updated successfully" : "Exam room created successfully");
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
              row: String(data?.row),
              column: String(data?.column),
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
    row,
    column,
  };
}
