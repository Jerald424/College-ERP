import { useQuery } from "@tanstack/react-query";
import { Tag } from "antd";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { formData } from "src/components/layouts/form";
import { makeDDMMYYYYToJsDate } from "src/functions/handleDate";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";
import { getExamSupportSupportData } from "src/views/exam/admin/schedules/createEdit/useCreate";

const getSchedule = async ({ id }) => {
  if (!id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  let response = await axiosInstance.get(`api/exam/student-schedule/${id}`);
  return response?.response;
};

export default function useDetailSchedule() {
  const { control, reset } = useForm();
  const id = useParams()?.id;
  const { data: exam_timetable, isLoading, isFetching } = useQuery({ queryKey: ["get/exam-schedule", id], queryFn: () => getSchedule({ id }) });
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
      name: "exam",
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
    {
      label: "Row",
      name: "row",
      type: "input_box",
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
    },
    {
      label: "Column",
      name: "column",
      type: "input_box",
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
    },
  ];

  let marks_columns = [
    {
      dataIndex: "max_mark",
      title: "Max Mark",
    },
    {
      dataIndex: "obtained_mark",
      title: "Obtained Mark",
    },
    {
      dataIndex: "status",
      title: "Status",
    },
  ];

  let marks_dataSource = useMemo(() => {
    let is_internal = exam_timetable?.exam_timetable?.exam?.type == "internal";
    let mark = exam_timetable?.exam_timetable?.exam_mark?.mark;
    let is_pass = mark >= (is_internal ? exam_timetable?.exam_timetable?.exam?.exam_config?.internal_pass_mark : exam_timetable?.exam_timetable?.exam?.exam_config?.external_pass_mark);
    return [
      {
        max_mark: is_internal ? exam_timetable?.exam_timetable?.exam?.exam_config?.internal : exam_timetable?.exam_timetable?.exam?.exam_config?.external,
        obtained_mark: mark ?? <Tag color="gold">Not Entered</Tag>,
        status: mark ? <Tag color={is_pass ? "green" : "red"}>{is_pass ? "Pass" : "Fail"}</Tag> : <Tag color="gold">Not Entered</Tag>,
      },
    ];
  }, [exam_timetable]);
  console.log("exam_timetable: ", exam_timetable);

  useEffect(() => {
    if (exam_timetable)
      reset({
        row: String(exam_timetable?.row),
        column: String(exam_timetable?.column),
        ...exam_timetable?.exam_timetable,
        date: makeDDMMYYYYToJsDate(exam_timetable?.date),
        exam: (
          <>
            {exam_timetable?.exam_timetable?.exam?.name} &nbsp;
            <Tag color={exam_timetable?.exam_timetable?.exam?.type?.id == "internal" ? "gold" : "green"}>{exam_timetable?.exam_timetable?.exam?.type?.value}</Tag>
          </>
        ),
      });
  }, [exam_timetable]);

  return { id, form_data, control, isLoading, exam_timetable, isFetching, marks_columns, marks_dataSource };
}
