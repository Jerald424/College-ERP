import { useMutation } from "@tanstack/react-query";
import { message } from "antd";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { formData } from "src/components/layouts/form";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";

const createEdit = async ({ mail_config }: { mail_config: any }) => {
  let url = mail_config?.id ? `api/base/mail-config/${mail_config?.id}` : "api/base/mail-config";
  let method = mail_config?.id ? "put" : "post";
  const response = await axiosInstance[method](url, { mail_config });
  return response;
};

const getRecord = async ({ id }: { id: number }) => {
  if (!id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get(`api/base/mail-config/${id}`);
  return response?.response;
};

export default function useCreate() {
  const { control, handleSubmit, reset, getValues } = useForm();
  const [search, setSearch] = useSearchParams();
  const { Modal, setIsOpen } = useConfirmationModal();
  const navigate = useNavigate();
  let record_id = search.get("id");
  const [isEdit, setIsEdit] = useState(false);

  const { mutate: getProgrammeMutate, isPending: isLoadingProgramme } = useMutation({ mutationKey: ["get/mail-config"], mutationFn: getRecord });
  const { mutate, isPending } = useMutation({ mutationKey: ["create/edit-user"], mutationFn: createEdit });

  let form_data: formData = [
    {
      label: "Email",
      name: "email",
      type: "input_box",
      rules: { required: "Name is required" },
      inputProps: { autoFocus: true },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df" },
      labelProps: { className: "f1" },
    },
    {
      label: "Password",
      name: "password",
      type: "input_box",
      rules: { required: "Code is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
    },
    {
      label: "Is Active",
      name: "is_active",
      type: "boolean",
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
    },
  ];

  const onSubmit = () => {
    try {
      setIsOpen(false);
      let mail_config = getValues();
      mutate(
        { mail_config },
        {
          onError: (error) => {
            message.error(error?.error);
          },
          onSuccess: (success) => {
            message.success(record_id ? "Mail config updated successfully" : "Mail config created successfully");
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
