import { DeleteOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { message, Tag } from "antd";
import { SelectInfo } from "antd/es/calendar/generateCalendar";
import { Dayjs } from "dayjs";
import { useMemo, useState } from "react";
import axiosInstance from "src/axiosInstance";
import { CheckBoxCmp } from "src/components/styled";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import { getMonthStartDateEndDateOfDate, makeJSDateToYYYYMMDD } from "src/functions/handleDate";
import { useColors } from "src/redux/hooks";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";
import { AdminCalenderPartProps } from "..";

const getDateRangeCalender = async ({ start_date, end_date }: { start_date: string; end_date: string }) => {
  if ([start_date, end_date].some((res) => !res)) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get(`api/calender/calender/${start_date}/${end_date}`);
  return response?.response;
};

const getSingleDayEvent = async ({ date }: { date: string }) => {
  if (!date) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get(`api/calender/calender/${date}`);
  return response?.response;
};

const deleteCalenderEvent = async ({ ids }: { ids: string }) => {
  const response = await axiosInstance.delete(`api/calender/calender/${ids}`);
  return response;
};

export default function useCalenderIndex(props: AdminCalenderPartProps) {
  const { colorWarning, colorWarningBg, colorError } = useColors();
  const [date, setDate] = useState(new Date());
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selected, setSelected] = useState([]);
  const { Modal, setIsOpen, isOpen } = useConfirmationModal();
  const [singleDate, setSingleDate] = useState(new Date());

  const { data: calenderData, isLoading: isLoadingCalender } = useQuery({
    queryKey: ["get/calender", date],
    queryFn: async () => {
      let [start_date, end_date] = getMonthStartDateEndDateOfDate(date);
      return await getDateRangeCalender({ end_date: makeJSDateToYYYYMMDD(end_date), start_date: makeJSDateToYYYYMMDD(start_date) });
    },
  });
  const { mutate: getSingleDayEventMutate, isPending: isLoadingGetSingleDay, data: singleDayData } = useMutation({ mutationKey: ["get/single-day"], mutationFn: getSingleDayEvent });
  const { mutate: eventDeleteMutate, isPending: isLoadingEventDelete } = useMutation({ mutationKey: ["delete/records"], mutationFn: deleteCalenderEvent });

  let calender_obj = useMemo(() => {
    try {
      return calenderData?.rows?.reduce((acc, cur) => {
        if (!acc[cur?.date]) acc[cur?.date] = [];
        acc[cur?.date]?.push(cur);
        return acc;
      }, {});
    } catch (error) {
      console.error(error);
    }
  }, [calenderData]);

  const cellRender = (dt) => {
    let yy_mm_dd = dt?.format?.("YYYY-MM-DD");
    let val_arr = calender_obj?.[yy_mm_dd] || [];
    try {
      return (
        <div>
          {props?.is_create && <CheckBoxCmp checked={props?.selectedDate?.includes?.(yy_mm_dd)} onChange={() => props?.handleSelectDate?.(dt)} style={{ position: "absolute", top: 0, zIndex: 99 }} />}
          <ul {...(props?.is_create && { onClick: () => handleChangeDate(dt, { source: "date" }, true) })}>
            {val_arr?.map((res) => (
              <li key={res?.id}>
                <div style={{ backgroundColor: colorWarningBg, color: colorWarning }}> {res?.is_holiday && "Holiday"}</div>
                {res?.title}
                {/* <div dangerouslySetInnerHTML={{ __html: res?.event_name }} /> */}
              </li>
            ))}
          </ul>
        </div>
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleChangeDate = (dt: Dayjs, type: SelectInfo, is_select_tag?: boolean) => {
    try {
      if (props?.is_create && !is_select_tag && type?.source == "date") return;
      let js_date = new Date(dt?.format?.());
      let [start_date, end_date] = getMonthStartDateEndDateOfDate(js_date);
      if (!(date >= start_date && date <= end_date)) setDate(js_date);
      if (type?.source == "date") {
        setIsOpenModal(true);
        getSingleDayEventMutate({ date: makeJSDateToYYYYMMDD(js_date) });
        setSingleDate(js_date);
      }
    } catch (error) {
      console.error(error);
    }
  };

  let isAllSelected = useMemo(() => {
    try {
      return singleDayData?.length === selected?.length;
    } catch (error) {
      console.error(error);
    }
  }, [selected, singleDayData]);

  let event_columns = [
    {
      dataIndex: "s.no",
      title: (
        <div>
          <CheckBoxCmp
            checked={isAllSelected}
            onChange={() => {
              if (isAllSelected) setSelected([]);
              else setSelected(() => singleDayData?.map((res) => res?.id));
            }}
            className="me-2"
          />{" "}
          #
        </div>
      ),
      align: "center",
    },
    {
      dataIndex: "event",
      title: "Event",
    },
    {
      dataIndex: "class",
      title: "Class",
    },
    {
      dataIndex: "actions",
      title: "Actions",
      align: "center",
    },
  ];

  let event_data_source = useMemo(() => {
    try {
      return singleDayData?.map((res, index) => ({
        "s.no": (
          <div>
            <CheckBoxCmp
              checked={selected?.includes(res?.id)}
              onChange={() =>
                setSelected((tmp) => {
                  let prev = [...tmp];
                  if (prev?.includes(res?.id)) {
                    let index = prev?.indexOf(res?.id);
                    prev?.splice(index, 1);
                  } else prev?.push(res?.id);
                  return prev;
                })
              }
              className="me-2"
            />
            {index + 1}
          </div>
        ),
        event: res?.title,
        class: res?.classes?.map((res) => <Tag key={res?.id}>{res?.acronym}</Tag>),
        actions: (
          <div>
            <DeleteOutlined onClick={() => setIsOpen(res)} style={{ color: colorError, fontSize: 20 }} className=" cp" />
          </div>
        ),
      }));
    } catch (error) {
      console.error(error);
    }
  }, [singleDayData, selected]);

  const handleDelete = () => {
    let ids = isOpen?.id ?? selected?.join(",");
    setIsOpen(false);
    eventDeleteMutate(
      { ids },
      {
        onSuccess: () => {
          message.success("Event delete successfully");
        },
        onError: (error) => {
          message.error(error?.error);
        },
        onSettled: () => {
          getSingleDayEventMutate({ date: makeJSDateToYYYYMMDD(singleDate) });
          setSelected([]);
        },
      }
    );
  };

  return {
    date,
    isLoadingCalender,
    cellRender,
    handleChangeDate,
    isOpenModal,
    setIsOpenModal,
    isLoadingGetSingleDay: isLoadingGetSingleDay || isLoadingEventDelete,
    event_columns,
    event_data_source,
    Modal,
    handleDelete,
    setIsOpen,
    selected,
  };
}
