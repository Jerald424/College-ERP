import { useMutation, useQuery } from "@tanstack/react-query";
import { message } from "antd";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { formData } from "src/components/layouts/form";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import { jsonToBase64, retrieveDataFromBase64 } from "src/functions/handleData";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";

const createOrEditRole = async ({ role }: { role: any }) => {
  let url = role?.id ? `api/base/role/${role?.id}` : "api/base/role";
  let method = role?.id ? "put" : "post";
  const response = await axiosInstance[method](url, { role });
  return response;
};

const getRoleSupportData = async () => {
  const response = await axiosInstance.get("api/base/roles-support-data");
  return response?.response;
};

const getRole = async ({ id }: { id: number }) => {
  if (!id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get(`api/base/role/${id}`);
  return response?.response;
};

export default function useCreate() {
  const { control, handleSubmit, reset, getValues } = useForm();
  const [search] = useSearchParams();
  const { Modal, setIsOpen } = useConfirmationModal();
  const navigate = useNavigate();
  const { mutate: getRoleMutate, isPending: isLoadingRole } = useMutation({ mutationKey: ["get/role"], mutationFn: getRole });
  const { mutate, isPending } = useMutation({ mutationKey: ["create/edit-user"], mutationFn: createOrEditRole });
  const { data: support_data, isLoading: isLoadingSupportData } = useQuery({ queryKey: ["get/role-support-data"], queryFn: getRoleSupportData });
  const [selectedPermissions, setSelectedPermissions] = useState({});

  let user_id = search.get("id");

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
      name: "level_id",
      type: "drop_down",
      rules: { required: "Level is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
      dropdownProps: { options: support_data?.["level"], optional_label: "value", optional_value: "id" },
    },
  ];

  const onSubmit = () => {
    try {
      setIsOpen(false);
      let role = getValues();
      role["permissions"] = jsonToBase64(selectedPermissions);
      mutate(
        { role },
        {
          onError: (error) => {
            message.error(error?.error);
          },
          onSuccess: () => {
            message.success(user_id ? "Role updated successfully" : "Role created successfully");
            navigate("/divider/base/roles");
          },
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user_id)
      getRoleMutate(
        { id: +user_id },
        {
          onSuccess: (data) => {
            if (data?.permissions) {
              setSelectedPermissions(() => {
                try {
                  return retrieveDataFromBase64(data?.permissions);
                } catch (error) {
                  console.error(error);
                  return {};
                }
              });
            }
            reset(() => ({ id: data?.id, name: data?.name, level_id: data?.level_id }));
          },
        }
      );
  }, []);

  return {
    control,
    form_data,
    user_id,
    handleSubmit: handleSubmit(() => setIsOpen(true)),
    Modal,
    navigate,
    isLoading: isLoadingRole || isPending,
    onSubmit,
    support_data,
    selectedPermissions,
    setSelectedPermissions,
    isLoadingSupportData,
  };
}
