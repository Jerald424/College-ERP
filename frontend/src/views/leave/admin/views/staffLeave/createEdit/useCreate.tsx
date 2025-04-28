import { useMutation, useQuery } from "@tanstack/react-query";
import { message } from "antd";
import { isEmpty, isObject } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { formData } from "src/components/layouts/form";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import { makeDDMMYYYYToJsDate, makeJSDateToYYYYMMDD } from "src/functions/handleDate";
import { useBase } from "src/redux/hooks";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";

const createEdit = async ({ leave }: { leave: any }) => {
  let url = leave?.id ? `api/leave/leave/${leave?.id}` : "api/leave/leave";
  let method = leave?.id ? "put" : "post";
  const response = await axiosInstance[method](url, { leave });
  return response;
};

const getRecord = async ({ id }: { id: number }) => {
  if (!id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get(`api/leave/leave/${id}`);
  return response?.response;
};

const getSupportData = async () => {
  const response = await axiosInstance.get(`/api/leave/leave-apply-support-data`);
  return response?.response;
};

const getLeaveConfig = async ({ staff_id }) => {
  if (!staff_id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get(`api/leave/config?staff_id=${staff_id}`);
  return response?.response;
};

const getRemains = async ({ leave_config_id, start_session, end_session, start_date, end_date, staff_id, id }) => {
  if ([leave_config_id, start_session, end_session, start_date, end_date, staff_id].some((res) => !res)) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  // taken-count/:staff_id/:leave_config_id/:start_date/:end_date/:start_session/:end_session
  let url = `api/leave/taken-count/${staff_id}/${leave_config_id}/${start_date}/${end_date}/${start_session}/${end_session}`;
  if (id) url += `?leave_id=${id}`;
  const response = await axiosInstance.get(url);
  return response?.response;
};

const createSubstitutions = async ({ substitute, leave_id }) => {
  if (isEmpty(substitute) || !leave_id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.post(`api/leave/substitute-staff/${leave_id}`, { substitute });
  return response;
};

const getScheduleForSubstitute = async ({ staff_id, start_date, end_date, start_session, end_session }) => {
  if ([staff_id, start_date, end_date, start_session, end_session].some((res) => !res)) return {};
  const response = await axiosInstance.get(`api/leave/scheduled-hours/${staff_id}/${start_date}/${end_date}/${start_session}/${end_session}`);
  return response;
};

const getSubstitute = async ({ leave_id }) => {
  if (!leave_id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get(`api/leave/substitute-staff/${leave_id}`);
  return response;
};

export default function useCreate() {
  const { control, handleSubmit, reset, getValues, setValue, watch } = useForm({
    defaultValues: {
      start_session: "forenoon",
      end_session: "afternoon",
      date: [new Date(), new Date()],
    },
  });

  const [search, setSearch] = useSearchParams();
  const { Modal, setIsOpen } = useConfirmationModal();
  const { Modal: DraftModal, setIsOpen: setDraftOpen, isOpen } = useConfirmationModal();
  const navigate = useNavigate();
  let record_id = search.get("id");
  const [isEdit, setIsEdit] = useState(false);
  const {
    user: { info },
  } = useBase();

  let [leave_config_id, start_session, end_session, date, staff_id] = useWatch({ control, name: ["leave_config_id", "start_session", "end_session", "date", "staff_id"] });

  const { mutate: getProgrammeMutate, isPending: isLoadingProgramme, data: leave_data } = useMutation({ mutationKey: ["get/applied-leave"], mutationFn: getRecord });
  const { mutate, isPending } = useMutation({ mutationKey: ["create/edit-user"], mutationFn: createEdit });
  const { data: supportData, isLoading: isLoadingSupportData } = useQuery({ queryKey: ["get/apply-leave-support-data"], queryFn: getSupportData });
  const { mutate: getRemainsMutate, isPending: isLoadingGetRemains, data: remainsDay, error } = useMutation({ mutationKey: ["get/leave-remains"], mutationFn: getRemains });
  const { data: leave_config, isLoading: isLoadingLeaveConfig } = useQuery({ queryKey: ["get/leave-config", staff_id], queryFn: () => getLeaveConfig({ staff_id }) });
  const { mutate: getScheduleMutate, isPending: isLoadingSchedule, data: schedules } = useMutation({ mutationKey: ["get/schedule-substitute"], mutationFn: getScheduleForSubstitute });
  const { mutate: createSubstituteMutate, isPending: isLoadingCreateSubstitute } = useMutation({ mutationKey: ["create/substitute"], mutationFn: createSubstitutions });
  const {
    data: substitutions,
    isLoading: isLoadingSubstitute,
    refetch: refetchSubstitutions,
  } = useQuery({ queryKey: ["get/substitute", record_id], queryFn: () => (record_id ? getSubstitute({ leave_id: record_id }) : null) });

  /* 
        {
            leave:{
              id : number
              reason : string
              start_date : date
              end_date : date
              start_session : forenoon | afternoon
              end_session : forenoon | afternoon
              status : draft|applied|approved|rejected
              evidence  : text
              leave_config_id : number
              staff_id: number
              }
        }
        */
  const clearSubstitute = () => setValue("substitute", null);

  let form_data = useMemo(() => {
    let arr: formData = [
      {
        label: "Leave Type",
        name: "leave_config_id",
        type: "drop_down",
        rules: { required: "Leave Type is required" },
        inputsContainerProps: { className: "f2" },
        conProps: { className: "df" },
        labelProps: { className: "f1" },
        dropdownProps: {
          options: leave_config?.rows,
          loading: isLoadingLeaveConfig,
          optional_label: "name",
          optional_value: "id",
          autoFocus: true,
          onChange: clearSubstitute,
        },
      },
      {
        label: "Date",
        name: "date",
        type: "date_picker",
        rules: { required: "Date is required" },
        datePickerProps: { date_picker_type: "date_range", onChange: clearSubstitute },
        inputsContainerProps: { className: "f2" },
        conProps: { className: "df" },
        labelProps: { className: "f1" },
      },
      {
        label: "Reason",
        name: "reason",
        type: "input_box",
        // rules: { required: "Date is required" },
        inputsContainerProps: { className: "f2" },
        conProps: { className: "df" },
        labelProps: { className: "f1" },
      },
      {
        label: "Start Session",
        name: "start_session",
        type: "drop_down",
        rules: { required: "Start Session is required" },
        inputsContainerProps: { className: "f2" },
        conProps: { className: "df" },
        labelProps: { className: "f1" },
        dropdownProps: {
          options: supportData?.sessions,
          loading: isLoadingSupportData,
          optional_label: "value",
          optional_value: "id",
          onChange: clearSubstitute,
        },
      },
      {
        label: "End Session",
        name: "end_session",
        type: "drop_down",
        rules: { required: "End Session is required" },
        inputsContainerProps: { className: "f2" },
        conProps: { className: "df" },
        labelProps: { className: "f1" },
        dropdownProps: {
          options: supportData?.sessions,
          loading: isLoadingSupportData,
          optional_label: "value",
          optional_value: "id",
          onChange: clearSubstitute,
        },
      },

      {
        label: "Evidence",
        name: "evidence",
        type: "input_box",
        inputsContainerProps: { className: "f2" },
        conProps: { className: "df" },
        labelProps: { className: "f1" },
        inputProps: {
          type: "file",
        },
      },
    ];
    if (info?.role == "college")
      arr.unshift({
        label: "Staff",
        name: "staff_id",
        type: "drop_down",
        rules: { required: "Staff is required" },
        inputsContainerProps: { className: "f2" },
        conProps: { className: "df" },
        labelProps: { className: "f1" },
        dropdownProps: {
          options: supportData?.staff,
          loading: isLoadingSupportData,
          optional_label: "name",
          optional_value: "id",
          onChange: () => reset((prev) => ({ ...prev, leave_config_id: null, substitute: null })),
        },
      });
    return arr;
  }, [info, isLoadingLeaveConfig, leave_config, isLoadingSupportData, supportData]);

  let selected_leave_type = useMemo(() => {
    try {
      return leave_config?.rows?.find((res) => res?.id == leave_config_id);
    } catch (error) {
      console.error(error);
    }
  }, [leave_config_id, leave_config]);

  let is_approval = useMemo(() => {
    try {
      return selected_leave_type?.approvers?.some((approver) => approver?.role == info?.user?.staff?.role?.id);
    } catch (error) {
      console.error(error);
    }
  }, [selected_leave_type, info]);

  const refetchLeave = () => {
    getProgrammeMutate(
      { id: record_id },
      {
        onSuccess: (data) => {
          reset((prev) => ({
            ...prev,
            ...data,
            role_ids: data?.approvers?.map((res) => res?.role),
            days: String(data?.days),
            date: [data?.start_date, data?.end_date]?.map((res) => makeDDMMYYYYToJsDate(res)),
          }));
        },
      }
    );
  };

  const fetchRemainDays = () => {
    try {
      let [start_date, end_date] = date?.map((res) => makeJSDateToYYYYMMDD(res));
      let obj = {
        leave_config_id,
        start_session,
        end_session,
        start_date,
        end_date,
        staff_id,
        id: record_id,
      };

      getRemainsMutate(obj);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSchedule = () => {
    let obj = {
      end_session,
      staff_id,
      start_session,
    };
    let [start_date, end_date] = date?.map((res) => makeJSDateToYYYYMMDD(res));
    Object.assign(obj, { end_date, start_date });
    getScheduleMutate(obj, {
      onSettled: () => {
        // setValue("substitute", null);
      },
    });
  };

  const onSubmit = () => {
    try {
      setIsOpen(false);
      let leave = getValues();
      [leave["start_date"], leave["end_date"]] = leave?.date?.map((date) => makeJSDateToYYYYMMDD(date));
      delete leave["date"];
      delete leave["status"];

      mutate(
        { leave },
        {
          onError: (error) => {
            message.error(error?.error);
          },
          onSuccess: (success) => {
            message.success(record_id ? "Leave updated successfully" : "Leave created successfully");
            let result = success?.response;
            if (!record_id) setSearch({ id: result?.id });
            let substitute = leave?.substitute || {};
            if (isObject(substitute)) {
              substitute = Object.entries(substitute)
                ?.filter(([_, staff_id]) => !!staff_id)
                ?.map(([schedule_id, staff_id]) => ({ schedule_id: +schedule_id, staff_id: +staff_id }));
              if (!isEmpty(substitute))
                createSubstituteMutate(
                  { leave_id: result?.id, substitute },
                  {
                    onError(error) {
                      message.error(String(error?.error));
                    },
                    onSettled: () => {
                      refetchSubstitutions();
                    },
                  }
                );
            }
            setIsEdit(false);
            fetchRemainDays();
          },
          onSettled: () => {
            refetchLeave();
          },
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  const makeAsDraft = () => {
    setDraftOpen(false);
    mutate(
      { leave: { id: record_id, status: isOpen } },
      {
        onSuccess: () => {
          message.success(`Leave move into ${isOpen} status`);
        },
        onError: (error) => {
          message.error(error?.error);
        },
        onSettled: () => {
          refetchLeave();
        },
      }
    );
  };

  const loadSubstitute = () => {
    try {
      let obj = substitutions?.response?.reduce((acc, cur) => {
        acc[cur?.scheduleId] = cur?.staffId;
        return acc;
      }, {});
      setValue("substitute", obj);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (record_id) refetchLeave();
  }, [record_id]);

  useEffect(() => {
    if (!record_id && info?.user?.staff?.id) reset((prev) => ({ ...prev, staff_id: info?.user?.staff?.id }));
  }, [info]);

  useEffect(() => {
    if ([leave_config_id, start_session, end_session, date, staff_id].every(Boolean)) fetchRemainDays();
    if ([staff_id, date, start_session, end_session].every(Boolean)) {
      fetchSchedule();
    }
  }, [leave_config_id, start_session, end_session, date, staff_id]);

  useEffect(() => {
    if (!isEmpty(substitutions?.response)) loadSubstitute();
  }, [substitutions]);

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
    selected_leave_type,
    error,
    isLoadingGetRemains,
    remainsDay,
    leave_data,
    setDraftOpen,
    DraftModal,
    makeAsDraft,
    isOpen,
    schedules,
    isLoadingSchedule,
    isLoadingSubstitute,
    is_approval,
  };
}
