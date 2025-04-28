import { useMutation, useQuery } from "@tanstack/react-query";
import { message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { formData } from "src/components/layouts/form";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import { makeJSDateToYYYYMMDD } from "src/functions/handleDate";
import { useBase } from "src/redux/hooks";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";

const getStaff = async ({ staff_id }: { staff_id: number }) => {
  if (!staff_id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get(`api/staff/staff/${staff_id}`);
  return response?.response;
};

const getSupportData = async () => {
  const response = await axiosInstance.get("api/staff/support-data");
  return response?.response;
};

const createEdit = async ({ staff }: { staff: any }) => {
  let url = staff?.id ? `api/staff/staff/${staff?.id}` : "api/staff/staff";
  let method = staff?.id ? "put" : "post";
  const response = await axiosInstance[method](url, { staff });
  return response;
};

export default function useDetailed({ is_profile }: { is_profile?: boolean }) {
  const { control, reset, getValues, handleSubmit } = useForm();
  const [search, setSearch] = useSearchParams();
  const [isEdit, setIsEdit] = useState(false);
  const { Modal, setIsOpen } = useConfirmationModal();

  const {
    user: { info },
  } = useBase();

  let record_id = search?.get("id") ?? (is_profile && info?.user?.staff_id);
  let staff_id = useMemo(() => {
    if (is_profile) return info?.user?.staff_id;
    else return record_id;
  }, [info, record_id]);

  const { data: staff, isPending: isLoadingStudent, mutate: getRecord } = useMutation({ mutationKey: ["get/staff"], mutationFn: () => getStaff({ staff_id }) });
  const { data: support_data, isLoading: isLoadingSupportData } = useQuery({ queryKey: ["get/support-data"], queryFn: getSupportData });

  const { mutate, isPending } = useMutation({ mutationKey: ["create/edit-user"], mutationFn: createEdit });

  const form_data = useMemo(() => {
    let arr: formData = [
      {
        label: "Name",
        name: "name",
        type: "input_box",
        inputsContainerProps: { className: "f2" },
        conProps: { className: "df" },
        labelProps: { className: "f1" },
        rules: {
          required: "Name is required",
        },
      },

      {
        label: "Code",
        name: "code",
        type: "input_box",
        inputsContainerProps: { className: "f2" },
        conProps: { className: "df" },
        labelProps: { className: "f1" },
        rules: {
          required: "Code is required",
        },
      },
      {
        label: "Gender",
        name: "gender",
        type: "drop_down",
        inputsContainerProps: { className: "f2" },
        conProps: { className: "df" },
        labelProps: { className: "f1" },
        dropdownProps: {
          loading: isLoadingSupportData,
          options: support_data?.["gender"],
          optional_label: "value",
          optional_value: "id",
        },
      },
      {
        label: "Department",
        name: "department_id",
        type: "drop_down",
        inputsContainerProps: { className: "f2" },
        conProps: { className: "df" },
        labelProps: { className: "f1" },
        dropdownProps: {
          loading: isLoadingSupportData,
          options: support_data?.["department"],
          optional_label: "name",
          optional_value: "id",
        },
      },
      {
        label: "Class",
        name: "class_ids",
        type: "drop_down",
        inputsContainerProps: { className: "f2" },
        conProps: { className: "df" },
        labelProps: { className: "f1" },
        dropdownProps: {
          loading: isLoadingSupportData,
          options: support_data?.["class"],
          optional_label: "acronym",
          optional_value: "id",
          mode: "multiple",
        },
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
        label: "Email",
        name: "email",
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
        inputProps: { type: "number" },
        labelProps: { className: "f1" },
      },
      {
        label: "DOB",
        name: "dob",
        type: "date_picker",
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
        inputProps: { type: "textarea" },
      },
      {
        label: "Active",
        name: "is_active",
        type: "boolean",
        inputsContainerProps: { className: "f2" },
        conProps: { className: "df" },
        labelProps: { className: "f1" },
      },
      {
        label: "Role",
        name: "role",
        type: "drop_down",
        inputsContainerProps: { className: "f2" },
        conProps: { className: "df" },
        labelProps: { className: "f1" },
        dropdownProps: {
          loading: isLoadingSupportData,
          options: support_data?.["role"],
          optional_label: "value",
          optional_value: "id",
        },
      },
    ];
    return arr;
  }, [isLoadingSupportData]);

  const loadValue = () => {
    try {
      reset({
        ...staff,
        class_ids: staff?.classes?.map((res) => res?.id),
        gender: staff?.gender?.id,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const onSubmit = () => {
    try {
      setIsOpen(false);
      let staff = getValues();
      if (staff?.["dob"]) staff["dob"] = makeJSDateToYYYYMMDD(new Date(staff?.["dob"]));

      mutate(
        { staff },
        {
          onError: (error) => {
            message.error(error?.error);
          },
          onSuccess: (success) => {
            message.success(record_id ? "Staff updated successfully" : "Staff created successfully");
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
    loadValue();
  }, [staff]);

  useEffect(() => {
    if (staff_id) getRecord();
  }, [staff_id]);
  return {
    control,
    form_data,
    isLoading: isLoadingStudent || isPending,
    staff,
    handleSubmit: handleSubmit(() => setIsOpen(true)),
    Modal,
    record_id,
    onSubmit,
    isEdit,
    setIsEdit,
    staff_id,
  };
}
