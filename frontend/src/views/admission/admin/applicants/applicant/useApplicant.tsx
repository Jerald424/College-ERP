import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useParams } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { formData } from "src/components/layouts/form";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";

const getApplicant = async ({ id }: { id: string | number }) => {
  if (!id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get(`api/admission/applicant/${id}`);
  return response;
};

const getApplicantFee = async ({ id }: { id: string | number }) => {
  if (!id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get(`api/admission/applicant-fee/${id}`);
  return response;
};

export default function useApplicant() {
  const params = useParams();
  const id = params?.id;
  const { data, isLoading, refetch: refetchApplicant } = useQuery({ queryKey: ["get/applicant"], queryFn: () => getApplicant({ id }) });
  const { data: applicant_fee, isLoading: isLoading_applicant_fee } = useQuery({ queryKey: ["get/applicant-fee"], queryFn: () => getApplicantFee({ id }) });
  const { control, reset } = useForm();
  let value = useWatch({ control });

  let form_data: formData = [
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

  const loadValue = () => {
    try {
      reset({
        ...data?.response,
        academic_year: data?.response?.academic_year?.name,
        district: data?.response?.district?.name,
        state: data?.response?.state?.name,
        programme: data?.response?.programme?.name,
        gender: data?.response?.gender?.value,
        programme_level: data?.response?.programme_level?.value,
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadValue();
  }, [data]);

  return { isLoading, control, form_data, applicant_fee, isLoading_applicant_fee, data, value, refetchApplicant, id };
}
