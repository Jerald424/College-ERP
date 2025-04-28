import { useMutation, useQuery } from "@tanstack/react-query";
import { message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { formData } from "src/components/layouts/form";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";

const createEdit = async ({ leave_config }: { leave_config: any }) => {
  let url = leave_config?.id ? `api/leave/config/${leave_config?.id}` : "api/leave/config";
  let method = leave_config?.id ? "put" : "post";
  const response = await axiosInstance[method](url, { leave_config });
  return response;
};

const getRecord = async ({ id }: { id: number }) => {
  if (!id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get(`api/leave/config/${id}`);
  return response?.response;
};

const getSupportData = async () => {
  const response = await axiosInstance.get("/api/leave/support-data");
  return response?.response;
};

export default function useCreate() {
  const { control, handleSubmit, reset, getValues, watch } = useForm();
  const [search, setSearch] = useSearchParams();
  const { Modal, setIsOpen } = useConfirmationModal();
  const navigate = useNavigate();
  let record_id = search.get("id");
  const [isEdit, setIsEdit] = useState(false);

  const { mutate: getProgrammeMutate, isPending: isLoadingProgramme } = useMutation({ mutationKey: ["get/programme"], mutationFn: getRecord });
  const { mutate, isPending } = useMutation({ mutationKey: ["create/edit-user"], mutationFn: createEdit });
  const { data: supportData, isLoading: isLoadingSupportData } = useQuery({ queryKey: ["get/support-data"], queryFn: getSupportData });

  /* 
            {
                leave_config:{
                  name:string,
                  code:string
                  type:paid|un_paid,
                  days:number,
                  days_for:year|month,
                  role_ids:number[]
                }   
            }
        */

  let [type] = useWatch({ control, name: ["type"] });
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
        label: "Code",
        name: "code",
        type: "input_box",
        rules: { required: "Code is required" },
        inputsContainerProps: { className: "f2" },
        conProps: { className: "df mt-1" },
        labelProps: { className: "f1" },
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
          options: supportData?.type,
          loading: isLoadingSupportData,
          optional_label: "value",
          optional_value: "id",
          onChange: () => {
            reset((prev) => ({ ...prev, days: null, days_for: null }));
          },
        },
      },

      {
        label: "Approver Role",
        name: "role_ids",
        type: "drop_down",
        rules: { required: "Approver role is required" },
        inputsContainerProps: { className: "f2" },
        conProps: { className: "df mt-1" },
        labelProps: { className: "f1" },
        dropdownProps: {
          options: supportData?.roles,
          loading: isLoadingSupportData,
          optional_label: "value",
          optional_value: "id",
          mode: "multiple",
        },
      },
    ];
    if (type == "paid")
      arr.splice(
        3,
        0,
        ...[
          {
            label: "Days",
            name: "days",
            type: "input_box",
            rules: { required: "Days is required" },
            inputsContainerProps: { className: "f2" },
            conProps: { className: "df mt-1" },
            labelProps: { className: "f1" },
            inputProps: { type: "number" },
          },
          {
            label: "Days For",
            name: "days_for",
            type: "drop_down",
            rules: { required: "Days for is required" },
            inputsContainerProps: { className: "f2" },
            conProps: { className: "df mt-1" },
            labelProps: { className: "f1" },
            dropdownProps: {
              options: supportData?.days_for,
              loading: isLoadingSupportData,
              optional_label: "value",
              optional_value: "id",
            },
          },
        ]
      );
    return arr;
  }, [type]);

  const onSubmit = () => {
    try {
      setIsOpen(false);
      let leave_config = getValues();
      mutate(
        { leave_config },
        {
          onError: (error) => {
            message.error(error?.error);
          },
          onSuccess: (success) => {
            message.success(record_id ? "Leave type updated successfully" : "Leave type created successfully");
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
              role_ids: data?.approvers?.map((res) => res?.role),
              days: String(data?.days),
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
