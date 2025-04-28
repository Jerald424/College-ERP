import { useMutation } from "@tanstack/react-query";
import { message } from "antd";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { formData } from "src/components/layouts/form";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import { makeDDMMYYYYToJsDate, makeJSDateToYYYYMMDD } from "src/functions/handleDate";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";

const createEdit = async ({ academic_year }: { academic_year: any }) => {
  let url = academic_year?.id ? `api/base/academic-year/${academic_year?.id}` : "api/base/academic-year";
  let method = academic_year?.id ? "put" : "post";
  const response = await axiosInstance[method](url, { academic_year });
  return response;
};

export const getTermCount = async (arg?: { academic_year_id: number }) => {
  let url = "api/base/term-count";
  if (arg?.academic_year_id) url += `?academic_year_id=${arg?.academic_year_id}`;
  const response = await axiosInstance.get(url);
  return response?.response;
};

export const getAcademicYearWithId = async ({ id }: { id: number }) => {
  if (!id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get(`api/base/academic-year/${id}`);
  return response?.response;
};

export default function useCreate() {
  const { control, handleSubmit, reset, getValues, watch } = useForm();
  const [search, setSearch] = useSearchParams();
  const { Modal, setIsOpen } = useConfirmationModal();
  const navigate = useNavigate();
  let record_id = search.get("id");
  const [isEdit, setIsEdit] = useState(false);

  const { mutate: getProgrammeMutate, isPending: isLoadingProgramme } = useMutation({ mutationKey: ["get/programme"], mutationFn: getAcademicYearWithId });
  const { mutate, isPending } = useMutation({ mutationKey: ["create/edit-user"], mutationFn: createEdit });

  let form_data: formData = [
    {
      label: "Name",
      name: "name",
      type: "input_box",
      rules: { required: "Name is required" },
      inputProps: { autoFocus: true },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df" },
      labelProps: { className: "f1" },
    },
    {
      label: "Date",
      name: "date",
      type: "date_picker",
      rules: { required: "Start Date is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
      datePickerProps: { date_picker_type: "date_range" },
    },
    {
      label: "Active",
      name: "active",
      type: "boolean",
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
    },
  ];

  const onSubmit = () => {
    try {
      setIsOpen(false);
      let academic_year = getValues();
      academic_year["start_date"] = makeJSDateToYYYYMMDD(academic_year?.date?.[0]);
      academic_year["end_date"] = makeJSDateToYYYYMMDD(academic_year?.date?.[1]);
      delete academic_year?.["date"];
      mutate(
        { academic_year },
        {
          onError: (error) => {
            message.error(error?.error);
          },
          onSuccess: (success) => {
            message.success(record_id ? "Academic  year updated successfully" : "Academic  year created successfully");
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
              date: [makeDDMMYYYYToJsDate(data?.start_date), makeDDMMYYYYToJsDate(data?.end_date)],
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
