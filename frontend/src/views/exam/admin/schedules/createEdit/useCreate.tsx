import { useMutation, useQuery } from "@tanstack/react-query";
import { Tag } from "antd";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { formData } from "src/components/layouts/form";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import { makeDDMMYYYYToJsDate } from "src/functions/handleDate";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";

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
  const { control, handleSubmit, reset } = useForm({ mode: "all" });
  const params = useParams();
  const { Modal, setIsOpen } = useConfirmationModal();
  const navigate = useNavigate();
  let record_id = params?.id;

  const { isPending: isLoadingProgramme, data: exam_timetable } = useQuery({ queryKey: ["get/exam"], queryFn: () => getRecord({ id: record_id }) });
  const { data: supportData, isLoading: isLoadingSupportData } = useQuery({ queryKey: ["get/exam-create-support-date"], queryFn: getExamSupportSupportData });

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
      type: "input_box",
      rules: { required: "Exam is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
      // dropdownProps: {
      //   options: supportData?.exam,
      //   optional_label: "name",
      //   optional_value: "id",
      //   loading: isLoadingSupportData,
      // },
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
        options: supportData?.course,
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
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    console.log("exam_timetable: ", exam_timetable);
    if (exam_timetable)
      reset({
        ...exam_timetable,
        date: makeDDMMYYYYToJsDate(exam_timetable?.date),
        exam_id: (
          <div>
            {/* {exam_timetable?.exam_id} */}
            {exam_timetable?.exam?.name} &nbsp;&nbsp;
            <Tag color={exam_timetable?.exam?.type?.id == "internal" ? "blue" : "green"}>{exam_timetable?.exam?.type?.value}</Tag>
          </div>
        ),
      });
  }, [exam_timetable]);

  return {
    control,
    form_data,
    record_id,
    handleSubmit: handleSubmit(() => setIsOpen(true)),
    Modal,
    navigate,
    isLoading: isLoadingProgramme,
    onSubmit,
    exam_timetable,
  };
}
