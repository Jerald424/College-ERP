import { useMutation, useQuery } from "@tanstack/react-query";
import { message } from "antd";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { formData } from "src/components/layouts/form";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";
import { getProgrammeSupportData } from "../../programme/createEdit/useCreate";
import { useBase } from "src/redux/hooks";
import { LinkOutlined } from "@ant-design/icons";

const createOrEditRole = async ({ application_fee }: { application_fee: any }) => {
  let url = application_fee?.id ? `api/admission/application-fee/${application_fee?.id}` : "api/admission/application-fee";
  let method = application_fee?.id ? "put" : "post";
  const response = await axiosInstance[method](url, { application_fee });
  return response;
};

const getApplicationFee = async ({ id }: { id: number }) => {
  if (!id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get(`api/admission/application-fee/${id}`);
  return response?.response;
};

export default function useCreate() {
  const { control, handleSubmit, reset, getValues } = useForm();
  const [search, setSearch] = useSearchParams();
  const { Modal, setIsOpen } = useConfirmationModal();
  const navigate = useNavigate();
  let record_id = search.get("id");
  const [isEdit, setIsEdit] = useState(false);
  const { academic_year } = useBase();

  const { mutate: getProgrammeMutate, isPending: isLoadingProgramme } = useMutation({ mutationKey: ["get/programme"], mutationFn: getApplicationFee });
  const { mutate, isPending } = useMutation({ mutationKey: ["create/edit-user"], mutationFn: createOrEditRole });
  const { data: supportData, isLoading: isLoadingSupportData } = useQuery({ queryKey: ["get/support-data"], queryFn: getProgrammeSupportData });

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
      name: "programme_level_id",
      type: "drop_down",
      rules: { required: "Level is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
      dropdownProps: { options: supportData?.level, optional_label: "value", optional_value: "id", loading: isLoadingSupportData },
    },
    {
      label: "Amount",
      name: "amount",
      type: "input_box",
      rules: { required: "Amount is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
      inputProps: { type: "number" },
    },
    {
      label: (
        <Link to={"/divider/base/academic-year"}>
          Academic Year <LinkOutlined />
        </Link>
      ),
      name: "academic_year_id",
      type: "drop_down",
      rules: { required: "Academic Year is required" },
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

  const onSubmit = () => {
    try {
      setIsOpen(false);
      let application_fee = getValues();
      mutate(
        { application_fee },
        {
          onError: (error) => {
            message.error(error?.error);
          },
          onSuccess: (success) => {
            message.success(record_id ? "Application fee updated successfully" : "Application fee created successfully");
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
            reset({ ...data });
          },
        }
      );
    else {
      reset({ academic_year_id: academic_year?.rows?.find((res) => res?.active)?.id });
    }
  }, [record_id, academic_year]);

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
