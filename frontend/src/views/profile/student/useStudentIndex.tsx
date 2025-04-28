import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { formData } from "src/components/layouts/form";

export default function useStudentIndex() {
  const { control, reset } = useForm();

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

  return { form_data, control };
}
