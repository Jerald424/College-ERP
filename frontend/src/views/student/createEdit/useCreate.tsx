import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { formData } from "src/components/layouts/form";
import { useBase } from "src/redux/hooks";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";

const getStudent = async ({ student_id }: { student_id: number }) => {
  if (!student_id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get(`api/student/student/${student_id}`);
  return response?.response;
};

export default function useDetailed({ is_student }: { is_student?: boolean }) {
  const { control, reset } = useForm();
  const [search] = useSearchParams();
  let record_id = search?.get("id");
  const {
    user: { info },
  } = useBase();
  let student_id = useMemo(() => {
    if (info?.role === "student") return info?.user?.student_id;
    else return record_id;
  }, [info]);
  const { data: student, isLoading: isLoadingStudent } = useQuery({ queryKey: ["get/student"], queryFn: () => getStudent({ student_id }) });

  const form_data = useMemo(() => {
    let arr: formData = [
      {
        label: "10th mark",
        name: "10th_mark",
        type: "input_box",
        inputsContainerProps: { className: "f2" },
        conProps: { className: "df" },
        labelProps: { className: "f1" },
      },
      {
        label: "10th mark sheet",
        name: "10th_marksheet",
        type: "input_box",
        inputsContainerProps: { className: "f2" },
        inputProps: { type: "file" },
        conProps: { className: "df" },
        labelProps: { className: "f1" },
      },
      {
        label: "Image",
        name: "image",
        type: "input_box",
        inputsContainerProps: { className: "f2" },
        inputProps: { type: "file" },
        conProps: { className: "df" },
        labelProps: { className: "f1" },
      },
      {
        label: "12th mark",
        name: "12th_mark",
        type: "input_box",
        inputsContainerProps: { className: "f2" },
        conProps: { className: "df" },
        labelProps: { className: "f1" },
      },
      {
        label: "12th marksheet",
        name: "12th_marksheet",
        type: "input_box",
        inputsContainerProps: { className: "f2" },
        conProps: { className: "df" },
        inputProps: { type: "file" },
        labelProps: { className: "f1" },
      },
      {
        label: "Academic year",
        name: "academic_year",
        type: "input_box",
        inputsContainerProps: { className: "f2" },
        conProps: { className: "df" },
        labelProps: { className: "f1" },
      },
      {
        label: "Address",
        name: "address",
        type: "input_box",
        inputsContainerProps: { className: "f2" },
        conProps: { className: "df" },
        labelProps: { className: "f1" },
      },
      {
        label: "District",
        name: "district",
        type: "input_box",
        inputsContainerProps: { className: "f2" },
        conProps: { className: "df" },
        labelProps: { className: "f1" },
      },
      {
        label: "Email",
        name: "email",
        type: "input_box",
        inputsContainerProps: { className: "f2" },
        conProps: { className: "df" },
        labelProps: { className: "f1" },
      },
      {
        label: "Gender",
        name: "gender",
        type: "input_box",
        inputsContainerProps: { className: "f2" },
        conProps: { className: "df" },
        labelProps: { className: "f1" },
      },
      {
        label: "District",
        name: "district",
        type: "input_box",
        inputsContainerProps: { className: "f2" },
        conProps: { className: "df" },
        labelProps: { className: "f1" },
      },
      {
        label: "Mobile",
        name: "mobile",
        type: "input_box",
        inputsContainerProps: { className: "f2" },
        conProps: { className: "df" },
        labelProps: { className: "f1" },
      },
      {
        label: "Name",
        name: "name",
        type: "input_box",
        inputsContainerProps: { className: "f2" },
        conProps: { className: "df" },
        labelProps: { className: "f1" },
      },
      {
        label: "Programme",
        name: "programme",
        type: "input_box",
        inputsContainerProps: { className: "f2" },
        conProps: { className: "df" },
        labelProps: { className: "f1" },
      },
      {
        label: "Programme level",
        name: "programme_level",
        type: "input_box",
        inputsContainerProps: { className: "f2" },
        conProps: { className: "df" },
        labelProps: { className: "f1" },
      },
      {
        label: "State",
        name: "state",
        type: "input_box",
        inputsContainerProps: { className: "f2" },
        conProps: { className: "df" },
        labelProps: { className: "f1" },
      },
    ];
    return arr;
  }, []);

  const loadValue = () => {
    try {
      reset({
        ...student?.applicant,
        academic_year: student?.applicant?.academic_year?.name,
        district: student?.applicant?.district?.name,
        state: student?.applicant?.state?.name,
        programme: student?.applicant?.programme?.name,
        gender: student?.applicant?.gender?.value,
        programme_level: student?.applicant?.programme_level?.value,
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadValue();
  }, [student]);
  return { control, form_data, isLoading: isLoadingStudent, student };
}
