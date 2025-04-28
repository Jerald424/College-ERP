import { CalendarOutlined, LoadingOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { message, Tag } from "antd";
import { isEmpty } from "lodash";
import axiosInstance from "src/axiosInstance";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import { makeDDMMYYYYToJsDate, makeJSDateToYYYYMMDD } from "src/functions/handleDate";

const fetchClassTermSchedule = async ({ class_id, term_id }) => {
  if ([class_id, term_id].some((res) => !res)) return {};
  const response = await axiosInstance.get(`api/schedule/check-schedule/${class_id}/${term_id}`);
  return response?.response;
};

const generateSchedule = async ({ schedules }) => {
  const response = await axiosInstance.post("api/schedule/schedule", { schedules });
  return response;
};

export default function GenerateSchedule({ term_id, hour_by_day, terms, class_id }: { term_id: number; hour_by_day: any; terms: any[]; class_id: number }) {
  const {
    data: schedules,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["get/schedule", { class_id, term_id }],
    queryFn: ({ queryKey: [_, value] }) => fetchClassTermSchedule({ class_id: value?.class_id, term_id: value?.term_id }),
  });
  const { mutate: generateScheduleMutate, isPending: isLoadingGenerateSchedule } = useMutation({ mutationKey: ["generate/schedule"], mutationFn: generateSchedule });
  const { Modal, setIsOpen } = useConfirmationModal();

  const handleCreateSchedule = () => {
    try {
      setIsOpen(false);
      let prev_schedule = schedules?.reduce((acc, cur) => {
        cur["date"] = makeJSDateToYYYYMMDD(makeDDMMYYYYToJsDate(cur?.date));
        if (!acc[cur?.date]) acc[cur?.date] = [];
        acc[cur?.date]?.push?.(cur?.timetable_id);
        return acc;
      }, {});

      let term = terms?.find((res) => res?.id == term_id);
      let [start_date, end_date] = [makeDDMMYYYYToJsDate(term?.start_date), makeDDMMYYYYToJsDate(term?.end_date)];
      let array = [];
      for (let date = start_date; date <= end_date; date?.setDate?.(date?.getDate() + 1)) {
        let day = date?.toLocaleDateString("en-us", { weekday: "short" });
        let YYYYMMDD = makeJSDateToYYYYMMDD(date);

        let obj = {
          timetable_ids: [],
          date: YYYYMMDD,
        };
        Object.entries(hour_by_day)?.forEach(([hour_id, days]) => {
          let current_day = days?.[day];
          if (current_day && !prev_schedule?.[YYYYMMDD]?.includes(current_day?.id)) obj["timetable_ids"]?.push(current_day?.id);
        });
        if (!isEmpty(obj?.timetable_ids)) array.push(obj);
      }
      if (isEmpty(array)) return message.warning("No new timetable found");
      generateScheduleMutate(
        { schedules: { schedule: array } },
        {
          onSettled: () => {
            refetch();
          },
          onError: (error) => {
            message.error(error?.error);
          },
          onSuccess: () => {
            message.success("Schedule created successfully");
          },
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Tag onClick={() => !isFetching && setIsOpen(true)} className="cp" color="green" icon={isFetching || isLoadingGenerateSchedule ? <LoadingOutlined /> : <CalendarOutlined />}>
        Generate Schedule
      </Tag>
      <Modal description="Create schedule for selected class & term" okButtonProps={{ onClick: handleCreateSchedule }} />
    </>
  );
}
