import { useMutation, useQuery } from "@tanstack/react-query";
import { message } from "antd";
import { Dayjs } from "dayjs";
import { isEmpty } from "lodash";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import axiosInstance from "src/axiosInstance";
import { formData } from "src/components/layouts/form";
import { makeDDMMYYYYToJsDate, makeJSDateToYYYYMMDD } from "src/functions/handleDate";
import { useBase } from "src/redux/hooks";

const getClass = async () => {
  const response = await axiosInstance.get("api/programme/class");
  return response?.response;
};

export const getTerms = async () => {
  const response = await axiosInstance.get("api/base/term");
  return response?.response;
};

const createEvent = async ({ payload }) => {
  const response = await axiosInstance.post("/api/calender/calender-create", { calender: payload });
  return response;
};

export const week_days_selection = [
  { id: "Mon", name: "Monday" },
  { id: "Tue", name: "Tuesday" },
  { id: "Wed", name: "Wednesday" },
  { id: "Thu", name: "Thursday" },
  { id: "Fri", name: "Friday" },
  { id: "Sat", name: "Saturday" },
  { id: "Sun", name: "Sunday" },
];

export default function useEventCreate() {
  const { control, reset, handleSubmit, watch } = useForm();
  const [selectedDate, setSelectedDate] = useState([]);
  const [terms, ac_year, days] = watch(["terms", "ac_year", "days"]);
  const { academic_year } = useBase();
  const [selectedFilterMode, setSelectedFilterMode] = useState("term");

  const { data: classes, isLoading: isLoadingClass } = useQuery({ queryKey: ["get/class"], queryFn: getClass });
  const { data: termsData, isLoading: isLoadingTerms } = useQuery({ queryKey: ["get/terms"], queryFn: getTerms });
  const { mutate: createEventMutate, isPending: isLoadingCreateMutate } = useMutation({ mutationKey: ["create/event"], mutationFn: createEvent });

  let form_data: formData = [
    {
      label: "Classes",
      name: "class_ids",
      type: "drop_down",
      rules: { required: "Name is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df" },
      labelProps: { className: "f1" },
      dropdownProps: {
        autoFocus: true,
        options: classes?.rows,
        loading: isLoadingClass,
        optional_label: "acronym",
        optional_value: "id",
        mode: "multiple",
      },
    },
  ];

  let description_form_data: formData = [
    {
      label: "Is Holiday",
      name: "is_holiday",
      type: "boolean",
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df col-lg-6" },
      labelProps: { className: "f1" },
    },
    {
      label: "Title",
      name: "title",
      type: "input_box",
      rules: { required: "Title is required" },
      conProps: {
        className: "col-lg-6 mt-1",
      },
    },
    {
      label: "Event",
      name: "event_name",
      type: "ckeEditor",
      // rules: { required: "Event is required" },
      conProps: { className: "mt-1" },
    },
  ];

  const handleSelectDate = (date: Dayjs) => {
    try {
      setSelectedDate((prev) => {
        let tmp = [...prev];
        let yy_mm_dd = makeJSDateToYYYYMMDD(new Date(date?.format()));

        if (tmp?.includes(yy_mm_dd)) {
          let index = tmp?.indexOf(yy_mm_dd);
          tmp?.splice?.(index, 1);
        } else tmp?.push(yy_mm_dd);
        return tmp;
      });
    } catch (error) {}
  };

  const resetDates = () => {
    try {
      if (isEmpty(terms) && isEmpty(ac_year)) setSelectedDate([]);
      else {
        let data_arr = selectedFilterMode == "term" ? termsData?.rows : academic_year?.rows;
        let selected_arr = selectedFilterMode == "term" ? terms : ac_year;

        let dates = data_arr
          ?.filter((res) => selected_arr?.includes(res?.id))
          ?.reduce((acc, cur) => {
            let start_date = makeDDMMYYYYToJsDate(cur?.start_date) || new Date();
            let end_date = makeDDMMYYYYToJsDate(cur?.end_date) || new Date();
            for (let x = start_date; x <= end_date; x.setDate(x.getDate() + 1)) {
              let day = x.toLocaleString("en-us", { weekday: "short" });
              if (days?.includes(day)) acc.push(makeJSDateToYYYYMMDD(x));
            }

            return acc;
          }, []);

        setSelectedDate(dates);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onSubmit = (data: any) => {
    try {
      let payload = {
        class_ids: data?.class_ids,
        event_name: data?.event_name,
        title: data?.title,
        is_holiday: data?.is_holiday,
        dates: selectedDate,
      };
      createEventMutate(
        { payload },
        {
          onSuccess() {
            message.success("Event created successfully.");
            reset();
            setSelectedDate([]);
          },
          onError(error) {
            message.error(error?.error);
          },
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    resetDates();
  }, [terms, ac_year, days]);

  return {
    control,
    form_data,
    handleSelectDate,
    selectedDate,
    description_form_data,
    reset,
    termsData,
    isLoadingTerms,
    selectedFilterMode,
    setSelectedFilterMode,
    handleSubmit: handleSubmit(onSubmit),
    isLoadingCreateMutate,
  };
}
