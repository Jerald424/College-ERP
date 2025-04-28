import { useMutation, useQuery } from "@tanstack/react-query";
import { message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { formData } from "src/components/layouts/form";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import { makeDDMMYYYYToJsDate, makeJSDateToYYYYMMDD } from "src/functions/handleDate";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";

const createEdit = async ({ exam_timetable }: { exam_timetable: any }) => {
  let url = exam_timetable?.id ? `api/exam/exam-timetable/${exam_timetable?.id}` : "api/exam/exam-timetable";
  let method = exam_timetable?.id ? "put" : "post";
  const response = await axiosInstance[method](url, { exam_timetable });
  return response;
};

const getRecord = async ({ id }: { id: number }) => {
  if (!id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get(`api/exam/exam-timetable/${id}`);
  return response?.response;
};

export const getExamSupportSupportData = async () => {
  const response = await axiosInstance.get("api/exam/exam-timetable-support-data");
  return response?.response;
};

export default function useCreate() {
  const { control, handleSubmit, reset, getValues, watch } = useForm({ mode: "all" });
  const [search, setSearch] = useSearchParams();
  const { Modal, setIsOpen } = useConfirmationModal();
  const navigate = useNavigate();
  let record_id = search.get("id");
  const [isEdit, setIsEdit] = useState(false);
  const [isOpenAllocateRoom, setIsOpenAllocateRoom] = useState(false);

  let [class_id, exam_room_id, date, exam_time_id] = watch(["class_id", "exam_room_id", "date", "exam_time_id"]);

  const { mutate: getProgrammeMutate, isPending: isLoadingProgramme } = useMutation({ mutationKey: ["get/exam-timetable"], mutationFn: getRecord });
  const { mutate, isPending } = useMutation({ mutationKey: ["create/exam-timetable"], mutationFn: createEdit });
  const { data: supportData, isLoading: isLoadingSupportData } = useQuery({ queryKey: ["get/support-data"], queryFn: getExamSupportSupportData });

  let course_options = useMemo(() => {
    try {
      return supportData?.course?.filter((course) => {
        let cls_ids = course?.classes?.map((res) => res?.id);
        return cls_ids?.includes(class_id);
      });
    } catch (error) {
      console.error(error);
    }
  }, [class_id, supportData]);

  let selected_room = useMemo(() => {
    try {
      return supportData?.exam_room?.find((res) => res?.id == exam_room_id);
    } catch (error) {
      console.error(error);
    }
  }, [exam_room_id, supportData]);

  let form_data: formData = [
    {
      label: "Date",
      name: "date",
      type: "date_picker",
      rules: { required: "Date is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df" },
      labelProps: { className: "f1" },
      datePickerProps: { autoFocus: true },
    },
    {
      label: "Exam Time",
      name: "exam_time_id",
      type: "drop_down",
      rules: { required: "Time is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
      dropdownProps: {
        options: supportData?.exam_time,
        optional_label: "name",
        optional_value: "id",
        loading: isLoadingSupportData,
      },
    },
    {
      label: "Exam",
      name: "exam_id",
      type: "drop_down",
      rules: { required: "Exam is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
      dropdownProps: {
        options: supportData?.exam,
        optional_label: "name",
        optional_value: "id",
        loading: isLoadingSupportData,
      },
    },
    {
      label: "Class",
      name: "class_id",
      type: "drop_down",
      rules: { required: "Class is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
      dropdownProps: {
        options: supportData?.class,
        optional_label: "name",
        optional_value: "id",
        onChange: () => reset((prev) => ({ ...prev, course_id: null })),
      },
    },
    {
      label: "Course",
      name: "course_id",
      type: "drop_down",
      rules: { required: "Course is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
      dropdownProps: {
        options: course_options,
        optional_label: "name",
        optional_value: "id",
        loading: isLoadingSupportData,
      },
    },
    {
      label: "Exam room",
      name: "exam_room_id",
      type: "drop_down",
      rules: { required: "Exam room is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
      dropdownProps: {
        options: supportData?.exam_room,
        optional_label: "name",
        optional_value: "id",
      },
    },
    {
      label: "Invigilator",
      name: "staff_id",
      type: "drop_down",
      rules: { required: "Invigilator is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
      dropdownProps: {
        options: supportData?.staff,
        optional_label: "name",
        optional_value: "id",
      },
    },
  ];

  const onSubmit = () => {
    try {
      setIsOpen(false);
      let exam_timetable = getValues();
      exam_timetable["date"] = makeJSDateToYYYYMMDD(exam_timetable["date"]);

      mutate(
        { exam_timetable },
        {
          onError: (error) => {
            message.error(error?.error);
          },
          onSuccess: (success) => {
            message.success(record_id ? "Exam timetable updated successfully" : "Exam timetable created successfully");
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
              date: makeDDMMYYYYToJsDate(data?.date),
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
    isOpenAllocateRoom,
    setIsOpenAllocateRoom,
    class_id,
    exam_room_id,
    date,
    exam_time_id,
    selected_room,
  };
}
