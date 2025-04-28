import { useMutation, useQuery } from "@tanstack/react-query";
import { message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { formData } from "src/components/layouts/form";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";

const createEdit = async ({ form }: { form: any }) => {
  let url = form?.id ? `api/feedback/form/${form?.id}` : "api/feedback/form";
  let method = form?.id ? "put" : "post";
  const response = await axiosInstance[method](url, { form });
  return response;
};

const getRecord = async ({ id }: { id: number }) => {
  if (!id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get(`api/feedback/form/${id}`);
  return response?.response;
};

const getDepartment = async () => {
  const response = await axiosInstance.get("/api/department/department");
  return response;
};

let form_for = [
  { id: "student", value: "Student" },
  { id: "staff", value: "Staff" },
];

let form_level = [
  { id: "college", value: "College" },
  { id: "department", value: "Department" },
];

export default function useCreate() {
  const { control, handleSubmit, reset, getValues, watch, setValue } = useForm();
  const [search, setSearch] = useSearchParams();
  const { Modal, setIsOpen } = useConfirmationModal();
  const navigate = useNavigate();
  let record_id = search.get("id");
  const [isEdit, setIsEdit] = useState(false);

  let [level] = watch(["level"]);

  const { mutate: getProgrammeMutate, isPending: isLoadingProgramme, data } = useMutation({ mutationKey: ["get/programme"], mutationFn: getRecord });
  const { mutate, isPending } = useMutation({ mutationKey: ["create/edit-user"], mutationFn: createEdit });
  const { data: department, isPending: isLoadingDepartment } = useQuery({ queryKey: ["get/department"], queryFn: getDepartment });

  let form_data = useMemo(() => {
    let arr: formData = [
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
        label: "Form For",
        name: "feedback_for",
        type: "drop_down",
        rules: { required: "For is required" },
        inputsContainerProps: { className: "f2" },
        conProps: { className: "df mt-1" },
        labelProps: { className: "f1" },
        dropdownProps: {
          options: form_for,
          optional_label: "value",
          optional_value: "id",
        },
      },
      {
        label: "Level",
        name: "level",
        type: "drop_down",
        rules: { required: "Level is required" },
        inputsContainerProps: { className: "f2" },
        conProps: { className: "df mt-1" },
        labelProps: { className: "f1" },
        dropdownProps: {
          options: form_level,
          optional_label: "value",
          optional_value: "id",
          onChange: () => setValue("department_ids", []),
        },
      },

      {
        label: "Date",
        name: "date",
        type: "date_picker",
        rules: { required: "Date is required" },
        inputsContainerProps: { className: "f2" },
        conProps: { className: "df mt-1" },
        labelProps: { className: "f1" },
        datePickerProps: {
          date_picker_type: "date_range",
          showTime: true,
        },
      },
    ];
    if (level == "department")
      arr.splice(-1, 0, {
        label: "Department",
        name: "department_ids",
        type: "drop_down",
        rules: { required: "Department is required" },
        inputsContainerProps: { className: "f2" },
        conProps: { className: "df mt-1" },
        labelProps: { className: "f1" },
        dropdownProps: {
          options: department?.response?.rows,
          optional_label: "name",
          optional_value: "id",
          mode: "multiple",
        },
      });
    return arr;
  }, [level, isLoadingDepartment, department]);

  const onSubmit = () => {
    try {
      setIsOpen(false);
      let form = getValues();
      [form["start_date"], form["end_date"]] = form?.date;

      mutate(
        { form },
        {
          onError: (error) => {
            message.error(error?.error);
          },
          onSuccess: (success) => {
            console.log("success: ", success);
            message.success(record_id ? "Feedback form updated successfully" : "Feedback form created successfully");
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
              department_ids: data?.feedback_form_departments?.map((res) => res?.id),
              question_ids: data?.form_questions?.map((res) => res?.id),
              date: [data?.start_date, data?.end_date],
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
    data,
    watch,
    reset,
    setValue,
  };
}
