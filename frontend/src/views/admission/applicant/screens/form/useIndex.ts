import { useMutation, useQuery } from "@tanstack/react-query";
import { message } from "antd";
import { isEmpty, isEqual } from "lodash";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import { jsonToBase64 } from "src/functions/handleData";
import { useBase } from "src/redux/hooks";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";

const getSupportData = async () => {
  let response = await axiosInstance.get("/api/admission/support-data");
  return response?.response;
};

const createApplicant = async ({ applicant, id }: { applicant: any; id?: number }) => {
  let url = id ? `api/admission/update-applicant/${id}` : "/api/admission/create-applicant";
  let method = id ? "put" : "post";
  const response = await axiosInstance[method](url, { applicant });
  return response?.response;
};

export const getApplicant = async ({ id }: { id: number }) => {
  if (!id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get(`/api/admission/applicant-details/${id}`);
  return response?.response;
};

export default function useFormIndex() {
  const { data: support_data } = useQuery({ queryKey: ["get/admission-support-data"], queryFn: getSupportData });
  const { control, handleSubmit, reset, setValue, getValues } = useForm();
  const { mutate, isPending } = useMutation({ mutationKey: ["post/applicant"], mutationFn: createApplicant });
  const navigate = useNavigate();
  const { user } = useBase();
  const { data: applicant_data, isPending: is_applicant_loading, mutate: getApplicantMutate } = useMutation({ mutationKey: ["get/applicant"], mutationFn: getApplicant });
  const [stepper, setStepper] = useState(0);
  const { Modal, setIsOpen } = useConfirmationModal();

  const onSubmit = (data: any) => {
    try {
      let payload = Object.entries(data)?.reduce((acc, [key, value]) => {
        if (!isEqual(value, applicant_data?.[key])) acc[key] = value;
        return acc;
      }, {});
      mutate(
        { applicant: payload, id: user?.info?.applicant?.id },
        {
          onSuccess: (data) => {
            if (user?.login) {
              message.success("Form updated");
              navigate("/admission/index/application-status");
            } else navigate(`/admission/index/success?data=${jsonToBase64({ username: data?.username, password: data?.password, application_no: data?.application_no })}`);
          },
          onError: (error) => {
            message.error(error?.error);
          },
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  const makeSubmit = () => {
    onSubmit({ ...getValues(), status: "submit" });
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isEmpty(applicant_data)) {
      let applicant = applicant_data;
      reset(applicant);
    }
  }, [applicant_data]);

  useEffect(() => {
    if (user?.login && user?.info?.role === "applicant") getApplicantMutate({ id: user?.info?.applicant?.id });
  }, [user]);

  return {
    support_data,
    control,
    handleSubmit: handleSubmit(onSubmit),
    isPending: isPending || is_applicant_loading,
    setValue,
    stepper,
    setStepper,
    isLogin: user?.login,
    Modal,
    setIsOpen,
    makeSubmit,
    applicant_data,
  };
}
