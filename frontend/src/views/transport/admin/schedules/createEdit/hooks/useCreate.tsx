import { useMutation, useQuery } from "@tanstack/react-query";
import { message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { formData } from "src/components/layouts/form";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import { makeDDMMYYYYToJsDate, makeJSDateToYYYYMMDD } from "src/functions/handleDate";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";

const createEdit = async ({ bus_schedule }: { bus_schedule: any }) => {
  let url = "api/transport/bus-schedule";
  let method = "post";
  const response = await axiosInstance[method](url, { bus_schedule });
  return response;
};

const getRecord = async ({ id }: { id: number }) => {
  if (!id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get(`api/transport/bus-schedule/${id}`);
  return response?.response;
};

const getBusSession = async () => {
  const response = await axiosInstance.get("api/transport/bus-session?create_schedule=1");
  return response;
};

let schedule_type = [
  { id: "arrive", value: "Arrive" },
  { id: "depart", value: "Depart" },
];

export default function useCreate() {
  const { control, handleSubmit, reset, getValues, watch, setValue } = useForm();
  const [search, setSearch] = useSearchParams();
  const { Modal, setIsOpen } = useConfirmationModal();
  const navigate = useNavigate();
  let record_id = search.get("id");
  const [isEdit, setIsEdit] = useState(false);

  const [session_id] = watch(["session_id"]);

  const { mutate: getProgrammeMutate, isPending: isLoadingProgramme, data } = useMutation({ mutationKey: ["get/programme"], mutationFn: getRecord });
  const { mutate, isPending } = useMutation({ mutationKey: ["create/edit-user"], mutationFn: createEdit });
  const { data: bus_session, isLoading: isLoadingBusSession } = useQuery({ queryKey: ["get/bus/session"], queryFn: getBusSession });

  let form_data = useMemo(() => {
    let arr: formData = [
      {
        label: "Date",
        name: "date",
        type: "date_picker",
        rules: { required: "Date is required" },
        inputProps: { autoFocus: true },
        inputsContainerProps: { className: "f2" },
        conProps: { className: "df" },
        labelProps: { className: "f1" },
      },
      {
        label: "Type",
        name: "type",
        type: "drop_down",
        rules: { required: "Type is required" },
        inputsContainerProps: { className: "f2" },
        conProps: { className: "df mt-1" },
        labelProps: { className: "f1" },
        dropdownProps: {
          options: schedule_type,
          optional_label: "value",
          optional_value: "id",
        },
      },
      {
        label: "Bus session",
        name: "session_id",
        type: "drop_down",
        rules: { required: "Session is required" },
        inputsContainerProps: { className: "f2" },
        conProps: { className: "df mt-1" },
        labelProps: { className: "f1" },
        dropdownProps: {
          options: bus_session?.response?.rows?.map((res) => ({ ...res, session_name: `${res?.bus?.name}-${res?.name}` })),
          optional_label: "session_name",
          optional_value: "id",
          loading: isLoadingBusSession,
        },
      },
    ];
    return arr;
  }, [bus_session, isLoadingBusSession]);

  const onSubmit = () => {
    try {
      setIsOpen(false);
      let bus_schedule = getValues();
      bus_schedule["date"] = makeJSDateToYYYYMMDD(bus_schedule?.date);

      mutate(
        { bus_schedule },
        {
          onError: (error) => {
            message.error(error?.error);
          },
          onSuccess: (success) => {
            console.log("success: ", success);
            message.success(record_id ? "Bus schedule updated successfully" : "Bus schedule created successfully");
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

  const fetchSchedule = () => {
    if (record_id) {
      getProgrammeMutate(
        { id: record_id },
        {
          onSuccess: (data) => {
            reset({
              ...data,
              date: makeDDMMYYYYToJsDate(data?.date),
            });
          },
        }
      );
    }
  };

  useEffect(() => {
    fetchSchedule();
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
    session_id,
    data,
    fetchSchedule,
  };
}
