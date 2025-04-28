import { useMutation, useQuery } from "@tanstack/react-query";
import { message } from "antd";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { formData } from "src/components/layouts/form";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import { makeDDMMYYYYToJsDate, makeJSDateToYYYYMMDD } from "src/functions/handleDate";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";
import { getAcademicYearWithId } from "../../useCreate";

const createEdit = async ({ term }: { term: any }) => {
  let url = term?.id ? `api/base/term/${term?.id}` : "api/base/term";
  let method = term?.id ? "put" : "post";
  const response = await axiosInstance[method](url, { term });
  return response;
};

export const getTermByID = async ({ id }: { id: number }) => {
  if (!id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get(`api/base/term/${id}`);
  return response?.response;
};

export const getHourCount = async (arg?: { term_id: number }) => {
  let url = "api/base/hour-count";
  if (arg?.term_id) url += `?term_id=${arg?.term_id}`;
  const response = await axiosInstance.get(url);
  return response?.response;
};

export default function useCreate() {
  const { control, handleSubmit, reset, getValues } = useForm();
  const [search, setSearch] = useSearchParams();
  const { Modal, setIsOpen } = useConfirmationModal();
  const navigate = useNavigate();
  let record_id = search.get("id");
  let academic_year_id = search.get("academic_year_id");
  const [isEdit, setIsEdit] = useState(false);

  const { mutate: getProgrammeMutate, isPending: isLoadingProgramme, data: term } = useMutation({ mutationKey: ["get/programme"], mutationFn: getTermByID });
  const { mutate, isPending } = useMutation({ mutationKey: ["create/edit-user"], mutationFn: createEdit });
  const { data: academic_year } = useQuery({ queryKey: ["get/academic-year"], queryFn: () => getAcademicYearWithId({ id: academic_year_id }) });

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
      label: "Active",
      name: "is_active",
      type: "boolean",
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
    },
    {
      label: "Date",
      name: "date",
      type: "date_picker",
      rules: { required: "Start date is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
      datePickerProps: { date_picker_type: "date_range" },
    },
    {
      label: "Academic Year",
      name: "academic_year",
      type: "input_box",
      rules: { required: "Name is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
      viewOnly: true,
    },
  ];

  const onSubmit = () => {
    try {
      setIsOpen(false);
      let term = getValues();
      term["start_date"] = makeJSDateToYYYYMMDD(term?.date?.[0]);
      term["end_date"] = makeJSDateToYYYYMMDD(term?.date?.[1]);
      term["academic_year_id"] = academic_year_id;
      delete term?.["date"];
      mutate(
        { term },
        {
          onError: (error) => {
            message.error(error?.error);
          },
          onSuccess: (success) => {
            message.success(record_id ? "Term updated successfully" : "Term created successfully");
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
            reset((prev) => ({
              ...prev,
              ...data,
              date: [makeDDMMYYYYToJsDate(data?.start_date), makeDDMMYYYYToJsDate(data?.end_date)],
            }));
          },
        }
      );
  }, [record_id]);

  useEffect(() => {
    reset((prev) => ({ ...prev, academic_year: academic_year?.name }));
  }, [academic_year]);

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
    academic_year,
    term,
  };
}
