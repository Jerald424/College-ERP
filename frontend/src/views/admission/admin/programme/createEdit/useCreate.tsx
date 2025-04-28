import { useMutation, useQuery } from "@tanstack/react-query";
import { message } from "antd";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { formData } from "src/components/layouts/form";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";

const createOrEditRole = async ({ programme }: { programme: any }) => {
  let url = programme?.id ? `api/admission/edit-programme/${programme?.id}` : "api/admission/create-programme";
  let method = programme?.id ? "put" : "post";
  const response = await axiosInstance[method](url, { programme });
  return response;
};

export const getProgramme = async ({ id }: { id: number }) => {
  if (!id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get(`api/admission/programme/${id}`);
  return response?.response;
};

export const getProgrammeSupportData = async () => {
  const response = await axiosInstance.get("api/admission/programme-support-data");
  return response?.response;
};

const getDepartment = async () => {
  const response = await axiosInstance.get("api/department/department");
  return response;
};

const getProgrammeClass = async ({ programme_id }: { programme_id: number }) => {
  const response = await axiosInstance.get(`api/programme/class?programme_id=${programme_id}`);
  return response?.response;
};

export default function useCreate() {
  const { control, handleSubmit, reset, getValues } = useForm();
  const [search, setSearch] = useSearchParams();
  const { Modal, setIsOpen } = useConfirmationModal();
  const navigate = useNavigate();
  let programme_id = search.get("id");
  const [isEdit, setIsEdit] = useState(false);

  const { mutate: getProgrammeMutate, isPending: isLoadingProgramme } = useMutation({ mutationKey: ["get/programme"], mutationFn: getProgramme });
  const { mutate, isPending } = useMutation({ mutationKey: ["create/edit-user"], mutationFn: createOrEditRole });
  const { data: supportData, isLoading: isLoadingSupportData } = useQuery({ queryKey: ["get/support-data"], queryFn: getProgrammeSupportData });
  const { data: department, isLoading: isLoadingDepartment } = useQuery({ queryKey: ["get/department"], queryFn: getDepartment });
  const { data: cls, isLoading: isLoadingCls } = useQuery({ queryKey: ["get/class"], queryFn: () => getProgrammeClass({ programme_id: programme_id }) });

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
      label: "Level",
      name: "programme_programme_level",
      type: "drop_down",
      rules: { required: "Level is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
      dropdownProps: { options: supportData?.level, optional_label: "value", optional_value: "id", loading: isLoadingSupportData },
    },
    {
      label: "Department",
      name: "department_id",
      type: "drop_down",
      rules: { required: "Department is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
      dropdownProps: { options: department?.response?.rows, optional_label: "name", optional_value: "id", loading: isLoadingDepartment },
    },
    {
      label: "Image",
      name: "image",
      type: "input_box",
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
      inputProps: { type: "file" },
    },
  ];

  let description: formData = [
    {
      label: "Description",
      name: "description",
      type: "input_box",
      inputsContainerProps: { className: "f2" },
      // conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
      inputProps: {
        type: "textarea",
      },
    },
  ];

  const onSubmit = () => {
    try {
      setIsOpen(false);
      let programme = getValues();
      mutate(
        { programme },
        {
          onError: (error) => {
            message.error(error?.error);
          },
          onSuccess: (success) => {
            message.success(programme_id ? "Programme updated successfully" : "Programme created successfully");
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
    if (programme_id)
      getProgrammeMutate(
        { id: programme_id },
        {
          onSuccess: (data) => {
            reset({ ...data });
          },
        }
      );
  }, [programme_id]);

  return {
    control,
    form_data,
    programme_id,
    handleSubmit: handleSubmit(() => setIsOpen(true)),
    Modal,
    navigate,
    isLoading: isPending || isLoadingProgramme,
    onSubmit,
    description,
    isEdit,
    setIsEdit,
    cls,
    isLoadingCls,
  };
}
