import { useMutation } from "@tanstack/react-query";
import { message } from "antd";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { formData } from "src/components/layouts/form";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import { useAppDispatch, useBase } from "src/redux/hooks";
import { getActiveInstitutionProfile } from "src/redux/reducers/base/request";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";

const createEdit = async ({ institution_profile }: { institution_profile: any }) => {
  let url = institution_profile?.id ? `api/institution/institution-profile/${institution_profile?.id}` : "api/institution/institution-profile";
  let method = institution_profile?.id ? "put" : "post";
  const response = await axiosInstance[method](url, { institution_profile });
  return response;
};

const getRecord = async ({ id }: { id: number }) => {
  if (!id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get(`api/institution/institution-profile/${id}`);
  return response?.response;
};

export default function useCreate() {
  const { control, handleSubmit, reset, getValues, watch } = useForm();
  const [search, setSearch] = useSearchParams();
  const { Modal, setIsOpen } = useConfirmationModal();
  const navigate = useNavigate();
  let record_id = search.get("id");
  const [isEdit, setIsEdit] = useState(false);
  const { academic_year } = useBase();
  const dispatch = useAppDispatch();

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
      label: "Image",
      name: "image",
      type: "input_box",
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
      inputProps: { type: "file", accept: "image/png, image/jpeg" },
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
      label: "Ac.Year",
      name: "academic_year_id",
      type: "drop_down",
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
      dropdownProps: {
        options: academic_year?.rows,
        optional_label: "name",
        optional_value: "id",
      },
    },
  ];

  let description: formData = [
    {
      label: "Description",
      name: "description",
      type: "ckeEditor",
      CKEEditorProps: {
        // style: { height: 200 },
      },
    },
  ];

  const onSubmit = () => {
    try {
      setIsOpen(false);
      let institution_profile = getValues();
      mutate(
        { institution_profile },
        {
          onError: (error) => {
            message.error(error?.error);
          },
          onSuccess: (success) => {
            message.success(record_id ? "Institution profile updated successfully" : "Institution profile created successfully");
            let result = success?.response;
            setSearch({ id: result?.id });
            setIsEdit(false);
          },
          onSettled: () => {
            dispatch(getActiveInstitutionProfile());
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

  useEffect(() => {
    if (!record_id) reset({ academic_year_id: academic_year?.rows?.find?.((res) => res?.active)?.id });
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
    description,
  };
}
