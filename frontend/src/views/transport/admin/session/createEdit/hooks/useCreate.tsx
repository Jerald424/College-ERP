import { useMutation, useQuery } from "@tanstack/react-query";
import { message } from "antd";
import { isObject } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { formData } from "src/components/layouts/form";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";

const createEdit = async ({ bus_session }: { bus_session: any }) => {
  let url = bus_session?.id ? `api/transport/bus-session/${bus_session?.id}` : "api/transport/bus-session";
  let method = bus_session?.id ? "put" : "post";
  const response = await axiosInstance[method](url, { bus_session });
  return response;
};

const getRecord = async ({ id }: { id: number }) => {
  if (!id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get(`api/transport/bus-session/${id}`);
  return response?.response;
};

const getBus = async () => {
  const response = await axiosInstance.get("api/transport/bus");
  return response;
};

const updatePassengerAndIncharges = async ({ payload }) => {
  const response = await axiosInstance.post("api/transport/bus-session/incharge/passenger", { payload });
  return response;
};

export default function useCreate() {
  const { control, handleSubmit, reset, getValues, watch, setValue } = useForm();
  const [search, setSearch] = useSearchParams();
  const { Modal, setIsOpen } = useConfirmationModal();
  const navigate = useNavigate();
  let record_id = search.get("id");
  const [isEdit, setIsEdit] = useState(false);

  const { mutate: getProgrammeMutate, isPending: isLoadingProgramme, data } = useMutation({ mutationKey: ["get/programme"], mutationFn: getRecord });
  const { mutate, isPending } = useMutation({ mutationKey: ["create/edit-user"], mutationFn: createEdit });
  const { data: bus, isLoading } = useQuery({ queryKey: ["get/bus"], queryFn: getBus });
  const { mutate: updatePassengerAndInchargesMutate, isPending: isLoadingUpdatePI } = useMutation({ mutationKey: ["update/passenger/incharge"], mutationFn: updatePassengerAndIncharges });

  let form_data = useMemo(() => {
    let arr: formData = [
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
        label: "Time",
        name: "time",
        type: "time_picker",
        rules: { required: "Time is required" },
        inputsContainerProps: { className: "f2" },
        conProps: { className: "df mt-1" },
        labelProps: { className: "f1" },
        timePickerProps: {
          time_picker_type: "time_range_picker",
        },
      },
      {
        label: "Bus",
        name: "bus_id",
        type: "drop_down",
        rules: { required: "Bus is required" },
        inputsContainerProps: { className: "f2" },
        conProps: { className: "df mt-1" },
        labelProps: { className: "f1" },
        dropdownProps: {
          options: bus?.response?.rows,
          optional_label: "name",
          optional_value: "id",
          loading: isLoading,
        },
      },
    ];
    return arr;
  }, [isLoading, bus]);

  const onSubmit = () => {
    try {
      setIsOpen(false);
      let bus_session = getValues();
      [bus_session["time_from"], bus_session["time_to"]] = bus_session?.time;
      if (record_id) {
        let payload = {
          bus_session_id: record_id,
        };
        if (isObject(bus_session?.incharge_ids))
          Object.assign(payload, {
            incharge_ids: Object.entries(bus_session?.incharge_ids)
              ?.filter(([_, value]) => value)
              ?.map(([key]) => key),
          });
        if (isObject(bus_session?.passenger_ids))
          Object.assign(payload, {
            passenger_ids: Object.entries(bus_session?.passenger_ids)
              ?.filter(([_, value]) => value)
              ?.map(([key]) => key),
          });
        updatePassengerAndInchargesMutate({ payload });
      }
      mutate(
        { bus_session },
        {
          onError: (error) => {
            message.error(error?.error);
          },
          onSuccess: (success) => {
            console.log("success: ", success);
            message.success(record_id ? "Bus session updated successfully" : "Bus session created successfully");
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
    if (record_id) {
      getProgrammeMutate(
        { id: record_id },
        {
          onSuccess: (data) => {
            reset({
              ...data,
              time: [data?.time_from, data?.time_to],
              incharge_ids: data?.incharges
                ?.map((res) => res?.id)
                ?.reduce((acc, cur) => {
                  acc[cur] = true;
                  return acc;
                }, {}),
              passenger_ids: data?.passengers
                ?.map((res) => res?.id)
                ?.reduce((acc, cur) => {
                  acc[cur] = true;
                  return acc;
                }, {}),
            });
          },
        }
      );
    }
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
    isLoadingUpdatePI,
  };
}
