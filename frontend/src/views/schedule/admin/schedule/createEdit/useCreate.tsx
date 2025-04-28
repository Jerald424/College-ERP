import { useMutation, useQuery } from "@tanstack/react-query";
import { Tag } from "antd";
import { isEmpty } from "lodash";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { formData } from "src/components/layouts/form";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";

const getRecord = async ({ id }: { id: number }) => {
  if (!id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get(`api/schedule/schedule/${id}`);
  return response?.response;
};

const getAttendance = async ({ schedule_id }) => {
  if (!schedule_id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get(`api/schedule/attendance/${schedule_id}`);
  return response?.response;
};

export default function useCreate() {
  const { control, reset } = useForm();
  const navigate = useNavigate();
  const params = useParams();
  let record_id = params?.["schedule_id"];

  const { isLoading: isLoadingProgramme, data: schedule, refetch } = useQuery({ queryKey: ["get/programme"], queryFn: () => getRecord({ id: record_id }) });
  const { data: attendance, isPending: isLoadingAttendance, mutate: getAttendanceMutate } = useMutation({ mutationKey: ["get/attendance"], mutationFn: getAttendance });

  let form_data: formData = [
    {
      label: "Date",
      name: "date",
      type: "input_box",
      rules: { required: "Date is required" },
      inputProps: { autoFocus: true },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df" },
      labelProps: { className: "f1" },
      viewOnly: true,
    },
    {
      label: "Day",
      name: "day",
      type: "input_box",
      rules: { required: "Day is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df " },
      labelProps: { className: "f1" },
      viewOnly: true,
    },
    {
      label: "Term",
      name: "term",
      type: "input_box",
      rules: { required: "Term is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df " },
      labelProps: { className: "f1" },
      viewOnly: true,
    },
    {
      label: "Hour",
      name: "hour",
      type: "input_box",
      rules: { required: "Hour is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df " },
      labelProps: { className: "f1" },
      viewOnly: true,
    },
    {
      label: "Classes",
      name: "classes",
      type: "input_box",
      rules: { required: "Class is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df " },
      labelProps: { className: "f1" },
      viewOnly: true,
    },
    {
      label: "Course",
      name: "course",
      type: "input_box",
      rules: { required: "Course is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df " },
      labelProps: { className: "f1" },
      viewOnly: true,
    },
    {
      label: "Staffs",
      name: "staffs",
      type: "input_box",
      rules: { required: "Staffs is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df " },
      labelProps: { className: "f1" },
      viewOnly: true,
    },
    {
      label: "Substitutions",
      name: "substitute_staffs",
      type: "input_box",
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df " },
      labelProps: { className: "f1" },
      viewOnly: true,
    },
  ];

  let attendance_summary = useMemo(() => {
    try {
      if (!isEmpty(attendance))
        return attendance?.reduce(
          (acc, cur) => {
            if (cur?.status?.id == "present") acc["present"] += 1;
            else acc["absent"] += 1;
            return acc;
          },
          { present: 0, absent: 0 }
        );
    } catch (error) {
      console.error(error);
    }
  }, [attendance]);

  const loadPrev = () => {
    try {
      reset({
        ...schedule,
        day: schedule?.timetable?.day?.value,
        term: schedule?.timetable?.term?.name,
        hour: schedule?.timetable?.hour?.name,
        classes: schedule?.timetable?.classes?.map((res) => <Tag key={res?.id}>{res?.name}</Tag>),
        course: schedule?.timetable?.course?.name,
        staffs: schedule?.timetable?.staffs?.map((res) => (
          <Tag {...(!isEmpty(schedule?.substitute_staffs) && { color: "red", style: { textDecoration: "line-through" } })} key={res?.id}>
            {res?.name}
          </Tag>
        )),
        substitute_staffs: schedule?.substitute_staffs?.map((res) => (
          <Tag color="green" key={`${res?.id}_substitutions`}>
            {res?.name}
          </Tag>
        )),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const refetchSchedule = () => {
    refetch().then(({ data }) => {
      if (data?.status?.id == "marked") getAttendanceMutate({ schedule_id: record_id });
    });
  };

  useEffect(() => {
    loadPrev();
    if (schedule?.status?.id == "marked") getAttendanceMutate({ schedule_id: record_id });
  }, [schedule]);

  return {
    control,
    form_data,
    record_id,
    navigate,
    isLoading: isLoadingProgramme,
    schedule,
    refetchSchedule,
    attendance,
    isLoadingAttendance,
    attendance_summary,
  };
}
