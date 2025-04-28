import { useMutation, useQuery } from "@tanstack/react-query";
import { message } from "antd";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { formData } from "src/components/layouts/form";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";
import { getProgramme } from "../../createEdit/useCreate";

const createOrEditRole = async ({ cls }: { cls: any }) => {
  let url = cls?.id ? `api/programme/class/${cls?.id}` : "api/programme/class";
  let method = cls?.id ? "put" : "post";
  const response = await axiosInstance[method](url, { cls });
  return response;
};

const getRecord = async ({ id }: { id: number }) => {
  if (!id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get(`api/programme/class/${id}`);
  return response?.response;
};

const getSupportData = async () => {
  const response = await axiosInstance.get("api/programme/class-support-data");
  return response?.response;
};

export default function useCreate() {
  const { control, handleSubmit, reset, getValues } = useForm();
  const [search, setSearch] = useSearchParams();
  const { Modal, setIsOpen } = useConfirmationModal();
  const navigate = useNavigate();
  let record_id = search.get("id");
  const [isEdit, setIsEdit] = useState(false);
  let params = useParams();

  const { mutate: getRecordMutate, isPending: isLoadingRecord } = useMutation({ mutationKey: ["get/programme"], mutationFn: getRecord });
  const { mutate, isPending } = useMutation({ mutationKey: ["create/edit-user"], mutationFn: createOrEditRole });
  const { data: programme } = useQuery({ queryKey: ["get/programme"], queryFn: () => getProgramme({ id: params?.["programme_id"] }) });
  const { data: support_data, isLoading: isLoadingSupportData } = useQuery({ queryKey: ["get/support-data"], queryFn: getSupportData });

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
      label: "Acronym",
      name: "acronym",
      type: "input_box",
      rules: { required: "Acronym is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
    },
    {
      label: "Year",
      name: "year",
      type: "drop_down",
      rules: { required: "Year is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
      dropdownProps: {
        options: support_data?.year,
        optional_label: "value",
        optional_value: "id",
        loading: isLoadingSupportData,
      },
    },
  ];

  const onSubmit = () => {
    try {
      setIsOpen(false);
      let cls = getValues();
      cls["programme_id"] = programme?.id;
      mutate(
        { cls },
        {
          onError: (error) => {
            message.error(error?.error);
          },
          onSuccess: (success) => {
            message.success(record_id ? "Class updated successfully" : "Class created successfully");
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
      getRecordMutate(
        { id: record_id },
        {
          onSuccess: (data) => {
            reset({ ...data });
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
    isLoading: isPending || isLoadingRecord,
    onSubmit,
    isEdit,
    setIsEdit,
    programme,
  };
}
