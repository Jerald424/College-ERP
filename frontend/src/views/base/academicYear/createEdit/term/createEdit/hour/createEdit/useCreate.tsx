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
import { getAcademicYearWithId } from "../../../../useCreate";
import { getTermByID } from "../../useCreate";

const createEdit = async ({ hour }: { hour: any }) => {
  let url = hour?.id ? `api/base/hour/${hour?.id}` : "api/base/hour";
  let method = hour?.id ? "put" : "post";
  const response = await axiosInstance[method](url, { hour });
  return response;
};

const getRecord = async ({ id }: { id: number }) => {
  if (!id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get(`api/base/hour/${id}`);
  return response?.response;
};

const getSupportData = async () => {
  const response = await axiosInstance.get("api/base/hour-create-support-data");
  return response?.response;
};

export default function useCreate() {
  const { control, handleSubmit, reset, getValues } = useForm();
  const [search, setSearch] = useSearchParams();
  const { Modal, setIsOpen } = useConfirmationModal();
  const navigate = useNavigate();
  let record_id = search.get("id");
  let academic_year_id = search.get("academic_year_id");
  let term_id = search.get("term_id");
  const [isEdit, setIsEdit] = useState(false);

  const { mutate: getProgrammeMutate, isPending: isLoadingProgramme, data: hour } = useMutation({ mutationKey: ["get/programme"], mutationFn: getRecord });
  const { mutate, isPending } = useMutation({ mutationKey: ["create/edit-user"], mutationFn: createEdit });
  const { data: academic_year } = useQuery({ queryKey: ["get/academic-year"], queryFn: () => getAcademicYearWithId({ id: academic_year_id }) });
  const { data: term } = useQuery({ queryKey: ["get/term"], queryFn: () => getTermByID({ id: term_id }) });
  const { data: support_data } = useQuery({ queryKey: ["get/support-data"], queryFn: getSupportData });

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
      label: "Time",
      name: "time",
      type: "time_picker",
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
      timePickerProps: { time_picker_type: "time_range_picker" },
    },
    {
      label: "Type",
      name: "type",
      type: "drop_down",
      rules: { required: "Type is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
      dropdownProps: {
        options: support_data?.hour_type,
        optional_label: "value",
        optional_value: "id",
      },
    },
    {
      label: "Session",
      name: "session",
      type: "drop_down",
      rules: { required: "Session is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
      dropdownProps: {
        options: support_data?.session,
        optional_label: "value",
        optional_value: "id",
      },
    },
    {
      label: "Term",
      name: "term",
      type: "input_box",
      rules: { required: "Term is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
      viewOnly: true,
    },
  ];

  const onSubmit = () => {
    try {
      setIsOpen(false);
      let hour = getValues();
      hour["term_id"] = term_id;
      hour["time_from"] = hour?.time?.[0];
      hour["time_to"] = hour?.time?.[1];
      delete hour?.["time"];

      mutate(
        { hour },
        {
          onError: (error) => {
            message.error(error?.error);
          },
          onSuccess: (success) => {
            message.success(record_id ? "Hour updated successfully" : "Hour created successfully");
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
              time: [data?.time_from, data?.time_to],
            }));
          },
        }
      );
  }, [record_id]);

  useEffect(() => {
    reset((prev) => ({ ...prev, term: term?.name }));
  }, [term]);

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
    hour,
    term,
  };
}
