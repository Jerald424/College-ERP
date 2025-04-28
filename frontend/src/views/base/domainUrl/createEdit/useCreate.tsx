import { useMutation, useQuery } from "@tanstack/react-query";
import { message } from "antd";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { formData } from "src/components/layouts/form";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";

const createEdit = async ({ domain_url }: { domain_url: any }) => {
  let url = domain_url?.id ? `api/base/domain-url/${domain_url?.id}` : "api/base/domain-url";
  let method = domain_url?.id ? "put" : "post";
  const response = await axiosInstance[method](url, { domain_url });
  return response;
};

const getRecord = async ({ id }: { id: number }) => {
  if (!id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get(`api/base/domain-url/${id}`);
  return response?.response;
};

const getSupportData = async () => {
  const response = await axiosInstance.get("api/base/domain-create-support-data");
  return response?.response;
};

export default function useCreate() {
  const { control, handleSubmit, reset, getValues } = useForm();
  const [search, setSearch] = useSearchParams();
  const { Modal, setIsOpen } = useConfirmationModal();
  const navigate = useNavigate();
  let record_id = search.get("id");
  const [isEdit, setIsEdit] = useState(false);

  const { mutate: getProgrammeMutate, isPending: isLoadingProgramme } = useMutation({ mutationKey: ["get/domain-url"], mutationFn: getRecord });
  const { mutate, isPending } = useMutation({ mutationKey: ["create/edit-user"], mutationFn: createEdit });
  const { data: support_data, isLoading: isLoadingSupportData } = useQuery({ queryKey: ["get/domain-url-support-data"], queryFn: getSupportData });

  let form_data: formData = [
    {
      label: "Source",
      name: "source",
      type: "drop_down",
      rules: { required: "Source is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df" },
      labelProps: { className: "f1" },
      dropdownProps: {
        autoFocus: true,
        loading: isLoadingSupportData,
        options: support_data?.source,
        optional_label: "value",
        optional_value: "id",
      },
    },
    {
      label: "Url",
      name: "url",
      type: "input_box",
      rules: { required: "Url is required" },
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
      let domain_url = getValues();
      mutate(
        { domain_url },
        {
          onError: (error) => {
            message.error(error?.error);
          },
          onSuccess: (success) => {
            message.success(record_id ? "Domain url updated successfully" : "Domain url created successfully");
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
