import { useMutation, useQuery } from "@tanstack/react-query";
import { message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import axiosInstance from "src/axiosInstance";
import { formData } from "src/components/layouts/form";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import { useBase } from "src/redux/hooks";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";

const getTerms = async ({ academic_year_id }: { academic_year_id: number }) => {
  const response = await axiosInstance.get(`api/base/term?academic_year_id=${academic_year_id}`);
  return response?.response;
};

export const getClass = async () => {
  const response = await axiosInstance.get("api/programme/class");
  return response?.response;
};

const getHour = async () => {
  const response = await axiosInstance.get("api/base/hour");
  return response?.response;
};

const getTimetable = async ({ class_id, term_id }: { class_id: number; term_id: number }) => {
  if ([class_id, term_id].some((res) => !res)) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get(`api/timetable/timetable/${class_id}/${term_id}`);
  return response?.response;
};

const getStaff = async () => {
  const response = await axiosInstance.get("/api/staff/staff");
  return response?.response;
};

const getCourse = async () => {
  const response = await axiosInstance.get("api/course/course");
  return response?.response;
};

const createTimetable = async ({ timetable }) => {
  const response = await axiosInstance.post(`api/timetable/timetable`, { timetable });
  return response;
};

const getSeparateTimetable = async ({ id }) => {
  if (!id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get(`/api/timetable/timetable/${id}`);
  return response?.response;
};

const deleteTimetable = async ({ ids }) => {
  if (!ids) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.delete(`/api/timetable/timetable/${ids}`);
  return response;
};

export default function useTimetableView() {
  const { active_academic_year } = useBase();
  const { control, watch, handleSubmit, reset } = useForm();
  const [modalOpen, setModelOpen] = useState();
  const [selectedHrDay, setSelectedHrDay] = useState([]);
  const { Modal, setIsOpen, isOpen } = useConfirmationModal();

  const { data: classes, isLoading: isLoadingClass } = useQuery({ queryKey: ["get/class"], queryFn: getClass });
  const { data: hours_data, isLoading: isLoadingHour } = useQuery({ queryKey: ["get/hour"], queryFn: getHour });
  const { data: staff } = useQuery({ queryKey: ["get/staff"], queryFn: getStaff });
  const { data: course } = useQuery({ queryKey: ["get/course"], queryFn: getCourse });
  const { mutate: getTimetableMutate, isPending: isLoadingTimetable, data: timetable } = useMutation({ mutationKey: ["get/time-table"], mutationFn: getTimetable });
  const { mutate: getTermsMutate, isPending: isLoadingTerms, data: terms } = useMutation({ mutationKey: ["get/terms"], mutationFn: getTerms });
  const { mutate: createTimetableMutate, isPending: isLoadingCreateTimetable } = useMutation({ mutationKey: ["create/time-table"], mutationFn: createTimetable });
  const { mutate: separateTimetableMutate, isPending: isLoadingSepTimetable } = useMutation({ mutationKey: ["get/separate-timetable"], mutationFn: getSeparateTimetable });
  const { mutate: deleteTimetableMutate, isPending: isLoadingDeleteTimetable } = useMutation({ mutationKey: ["delete/timetable"], mutationFn: deleteTimetable });

  const [term_id, class_id] = watch(["term_id", "class_id"]);

  let hour = useMemo(() => {
    try {
      return hours_data?.rows?.filter((res) => res?.term_id == term_id);
    } catch (error) {
      console.error(error);
    }
  }, [term_id, hours_data]);

  let is_generate_schedule_enabled = useMemo(() => [term_id, class_id].every(Boolean), [term_id, class_id]);

  let form_data: formData = [
    {
      label: "Term",
      name: "term_id",
      type: "drop_down",
      rules: { required: "Term is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df" },
      labelProps: { className: "f1" },
      dropdownProps: {
        autoFocus: true,
        options: terms?.rows,
        optional_label: "name",
        optional_value: "id",
        loading: isLoadingTerms,
        onChange: () => {
          setSelectedHrDay([]);
        },
      },
    },
    {
      label: "Class",
      name: "class_id",
      type: "drop_down",
      rules: { required: "Class is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
      dropdownProps: {
        options: classes?.rows,
        optional_label: "name",
        optional_value: "id",
        loading: isLoadingClass,
        onChange: () => {
          setSelectedHrDay([]);
        },
      },
    },
  ];

  let tt_object = useMemo(() => {
    try {
      if (!timetable) return;
      let hr_based = timetable?.reduce((acc, cur) => {
        if (!acc[cur?.hour_id]) acc[cur?.hour_id] = [];
        acc[cur?.hour_id]?.push(cur);
        return acc;
      }, {});
      let hr_day_based = Object.entries(hr_based)?.reduce((acc, [key, value]) => {
        if (!acc[key]) acc[key] = {};
        value?.forEach((day) => {
          acc[key][day?.day] = day;
        });

        return acc;
      }, {});
      return hr_day_based;
    } catch (error) {
      console.error(error);
    }
  }, [timetable]);

  const handleSelectHour = ({ name }: { name: string }) => {
    try {
      setSelectedHrDay((prev) => {
        let tmp = [...prev];
        if (tmp?.includes(name)) {
          let index = tmp?.indexOf(name);
          tmp?.splice(index, 1);
        } else tmp?.push(name);
        return tmp;
      });
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTimetable = () => {
    getTimetableMutate({ class_id, term_id });
  };
  const onSubmit = (data) => {
    /*
            timetable:{
            hours:[
                {
                    id:number;
                    hour_id:number,
                    course_id:number,
                    staff_ids:number[],
                    class_ids:number[],
                    day:string
                }
            ],
            term_id:number
    }
            */
    try {
      let timetable = {
        hours: selectedHrDay?.map((slHr) => {
          let [hour_id, day] = slHr?.split?.("_");
          return {
            id: data?.id,
            hour_id,
            course_id: data?.course_id_tt,
            staff_ids: data?.staff_ids_tt,
            class_ids: data?.class_ids_tt,
            day,
          };
        }),
        term_id: data?.term_id,
      };
      setModelOpen(false);
      reset();
      setSelectedHrDay([]);

      createTimetableMutate(
        { timetable },

        {
          onSettled: () => {
            fetchTimetable();
          },
          onSuccess: () => {
            message.success("Timetable created successfully");
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

  const onEditTimetable = ({ timetable }: { timetable: any }) => {
    setModelOpen(true);
    setSelectedHrDay([`${timetable?.hour_id}_${timetable?.day}`]);
    separateTimetableMutate(
      { id: timetable?.id },
      {
        onSuccess: (success) => {
          reset((prev) => ({
            ...prev,
            class_ids_tt: success?.classes?.map((res) => res?.id),
            course_id_tt: success?.course_id,
            staff_ids_tt: success?.staffs?.map((res) => res?.id),
            id: success?.id,
          }));
        },
      }
    );
  };

  const handleDelete = () => {
    let ids = isOpen?.id;
    setIsOpen(false);
    deleteTimetableMutate(
      { ids },
      {
        onSuccess: () => {
          message.success("Timetable deleted successfully");
        },
        onSettled: () => {
          fetchTimetable();
        },
        onError: (error) => {
          message.error(error?.error);
        },
      }
    );
  };

  useEffect(() => {
    getTermsMutate({ academic_year_id: active_academic_year?.id });
  }, [active_academic_year]);

  useEffect(() => {
    fetchTimetable();
  }, [term_id, class_id]);

  return {
    control,
    form_data,
    hour,
    tt_object,
    classes,
    staff,
    course,
    modalOpen,
    setModelOpen,
    handleSelectHour,
    selectedHrDay,
    terms,
    handleSubmit: handleSubmit(onSubmit),
    reset,
    isLoadingTimetable: isLoadingCreateTimetable || isLoadingCreateTimetable || isLoadingHour || isLoadingTimetable || isLoadingDeleteTimetable,
    onEditTimetable,
    isLoadingSepTimetable,
    setIsOpen,
    Modal,
    setSelectedHrDay,
    handleDelete,
    is_generate_schedule_enabled,
    term_id,
    class_id,
  };
}
