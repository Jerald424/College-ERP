import { useMutation, useQuery } from "@tanstack/react-query";
import { message } from "antd";
import { isEmpty } from "lodash";
import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { formData } from "src/components/layouts/form";
import { InputBoxWithHK } from "src/components/styled";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";

const updateFee = async ({ collect_fee }: { collect_fee: any }) => {
  let response = await axiosInstance.post("api/admission/collect-application-fee", {
    collect_fee,
  });
  return response;
};

const getApplicationFee = async ({ id }: { id: number }) => {
  if (!id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get(`api/admission/fee-process/${id}`);
  return response?.response;
};

const getApplicant = async () => {
  const response = await axiosInstance.get("api/admission/fee-process-list");
  return response?.response;
};

export const selectApplicant = async ({ applicant_ids, status = "selected" }: { applicant_ids: any[]; status?: string }) => {
  const response = await axiosInstance.post(`api/admission/process-applicant/${status}`, { applicant_ids });
  return response;
};

export default function useCreate() {
  const { control, handleSubmit, reset, getValues } = useForm({ mode: "all" });
  const [search] = useSearchParams();
  const { Modal, setIsOpen } = useConfirmationModal();
  const { Modal: SelectModal, setIsOpen: setIsSelect } = useConfirmationModal();
  const navigate = useNavigate();
  let record_id = search.get("id");
  let applicant_id = useWatch({ control, name: "name" });
  let fee_entered = useWatch({ control, name: "fee" });

  const { mutate: getRecord, isPending: isLoadingRecord } = useMutation({ mutationKey: ["get/programme"], mutationFn: getApplicationFee });
  const { mutate, isPending } = useMutation({ mutationKey: ["create/edit-user"], mutationFn: updateFee });
  const { data: applicants, refetch } = useQuery({ queryKey: ["get/applicant"], queryFn: getApplicant });
  const { mutate: selectApplicantMutate, isPending: isLoadingSelectApplicant } = useMutation({ mutationKey: ["select/applicant"], mutationFn: selectApplicant });

  let selected_applicant = useMemo(() => {
    try {
      return applicants?.rows?.find((res) => res?.id == applicant_id);
    } catch (error) {
      console.error(error);
    }
  }, [applicant_id, applicants]);

  let is_disabled_save = useMemo(() => {
    try {
      if (isEmpty(fee_entered)) return true;
      else return Object.values(fee_entered)?.reduce((acc, cur) => (acc += +cur)) <= 0;
    } catch (error) {
      console.error(error);
    }
  }, [fee_entered]);

  let is_no_due = useMemo(() => {
    try {
      return selected_applicant?.applicant_fee?.application_fee?.amount - selected_applicant?.applicant_fee?.paid == 0;
    } catch (error) {
      console.error(error);
    }
  }, [selected_applicant]);

  let columns = [
    {
      dataIndex: "s.no",
      title: "#",
    },
    {
      dataIndex: "scheduled",
      title: "Scheduled",
    },
    {
      dataIndex: "paid",
      title: "Paid",
      align: "right",
    },
    {
      dataIndex: "due",
      title: "Due",
      align: "right",
    },
    {
      dataIndex: "to_pay",
      title: "To pay",
      align: "right",
    },
  ];

  let dataSource = useMemo(() => {
    let due_amt = selected_applicant?.applicant_fee?.application_fee?.amount - selected_applicant?.applicant_fee?.paid;
    if (selected_applicant)
      return [
        {
          "s.no": 1,
          scheduled: selected_applicant?.applicant_fee?.application_fee?.amount,
          paid: selected_applicant?.applicant_fee?.paid,
          due: due_amt,
          to_pay: (
            <InputBoxWithHK
              control={control}
              inputProps={{
                type: "number",
                className: "text-end",
              }}
              name={`fee.${selected_applicant?.applicant_fee?.id}`}
              rules={{
                max: { message: "Must be less than due.", value: due_amt },
                validate: (val) => (+val >= 0 ? true : "Enter valid amount"),
              }}
            />
          ),
        },
      ];
    else [];
  }, [selected_applicant]);

  let form_data: formData = [
    {
      label: "Name",
      name: "name",
      type: "drop_down",
      rules: { required: "Name is required" },
      inputProps: { autoFocus: true },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df" },
      labelProps: { className: "f1" },
      dropdownProps: { options: applicants?.rows, optional_value: "id", optional_label: "name" },
    },
  ];

  const onSubmit = () => {
    try {
      setIsOpen(false);
      let collect_fee = getValues();
      collect_fee["applicant_id"] = collect_fee?.["name"];
      collect_fee["paid"] = Object.values(collect_fee?.["fee"])?.reduce((acc, cur) => (acc += +cur));
      mutate(
        { collect_fee },
        {
          onError: (error) => {
            message.error(error?.error);
          },
          onSuccess: (success) => {
            console.log("success: ", success);
            message.success("Application fee collected");
            let result = success?.response;
          },
          onSettled: () => {
            // getRecord({ id: record_id });
            refetch();
            reset((prev) => ({ ...prev, fee: null }));
          },
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (record_id)
      getRecord(
        { id: record_id },
        {
          onSuccess: (data) => {
            reset({
              name: data?.id,
            });
          },
        }
      );
  }, [record_id]);

  return {
    control,
    form_data,
    handleSubmit: handleSubmit(() => setIsOpen(true)),
    Modal,
    navigate,
    isLoading: isPending || isLoadingRecord || isLoadingSelectApplicant,
    onSubmit,
    columns,
    dataSource,
    is_disabled_save,
    is_no_due,
    SelectModal,
    setIsSelect,
    handleSelect: () => {
      selectApplicantMutate(
        { applicant_ids: [selected_applicant?.id] },
        {
          onSettled: () => {
            refetch();
          },
        }
      );
      setIsSelect(false);
    },
    selected_applicant,
  };
}
