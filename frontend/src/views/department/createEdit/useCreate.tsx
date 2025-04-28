import { useMutation } from "@tanstack/react-query";
import { message } from "antd";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { formData } from "src/components/layouts/form";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";

const createEdit = async ({ department }: { department: any }) => {
  let url = department?.id ? `api/department/department/${department?.id}` : "api/department/department";
  let method = department?.id ? "put" : "post";
  const response = await axiosInstance[method](url, { department });
  return response;
};

const getRecord = async ({ id }: { id: number }) => {
  if (!id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get(`api/department/department/${id}`);
  return response?.response;
};

export default function useCreate() {
  const { control, handleSubmit, reset, getValues } = useForm();
  const [search, setSearch] = useSearchParams();
  const { Modal, setIsOpen } = useConfirmationModal();
  const navigate = useNavigate();
  let record_id = search.get("id");
  const [isEdit, setIsEdit] = useState(false);

  const { mutate: getProgrammeMutate, isPending: isLoadingProgramme } = useMutation({ mutationKey: ["get/programme"], mutationFn: getRecord });
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
      label: "Code",
      name: "code",
      type: "input_box",
      rules: { required: "Code is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
    },
  ];

  const onSubmit = () => {
    try {
      setIsOpen(false);
      let department = getValues();
      mutate(
        { department },
        {
          onError: (error) => {
            message.error(error?.error);
          },
          onSuccess: (success) => {
            message.success(record_id ? "Department updated successfully" : "Department created successfully");
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
