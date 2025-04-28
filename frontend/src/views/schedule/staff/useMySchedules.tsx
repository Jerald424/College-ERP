import { EyeFilled, UserAddOutlined, UserDeleteOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Tag } from "antd";
import { isEmpty } from "lodash";
import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { makeJSDateToYYYYMMDD } from "src/functions/handleDate";
import { useBase, useColors } from "src/redux/hooks";

const getMySchedules = async ({ date }: { date: string }) => {
  if (!date) return {};
  const response = await axiosInstance.get(`api/schedule/my-schedules/${date}`);
  return response?.response;
};
export default function useMySchedules() {
  const {
    user: { info },
  } = useBase();
  console.log("info: ", info);
  const { colorSuccess, colorError, colorPrimary } = useColors();
  const [search, setSearch] = useSearchParams();
  let str_date = search?.get("date");
  const date = str_date ? new Date(str_date) : new Date();
  const { data, isFetching, isLoading } = useQuery({ queryKey: ["get/my-schedule", str_date], queryFn: () => getMySchedules({ date: makeJSDateToYYYYMMDD(date) }) });

  const columns = [
    {
      dataIndex: "time",
      title: "Time",
      align: "center",
    },
    {
      dataIndex: "hour",
      title: "Hour",
    },
    {
      dataIndex: "course",
      title: "Course",
    },
    {
      dataIndex: "class",
      title: "Class",
    },
    {
      dataIndex: "staffs",
      title: "Staffs",
    },
    {
      dataIndex: "attendance",
      title: "Attendance",
      align: "center",
    },
    {
      dataIndex: "status",
      title: "Status",
    },
    {
      dataIndex: "action",
      title: "Action",
      align: "center",
    },
  ];

  let sch_data = useMemo(() => {
    try {
      return data?.map((res) => {
        let is_substitute_schedule = !isEmpty(res?.substitute_staffs);
        let is_my_hour = res?.substitute_staffs?.map((res) => res?.id)?.includes(info?.user?.staff_id);
        return {
          time: `${res?.timetable?.hour?.time_from?.split(":")?.splice(0, 2)?.join(":")} to ${res?.timetable?.hour?.time_to?.split(":")?.splice(0, 2)?.join(":")}`,
          hour: res?.timetable?.hour?.name,
          course: res?.timetable?.course?.name,
          class: res?.timetable?.classes?.map((cls) => <Tag key={cls?.id}>{cls?.name}</Tag>),
          staffs: (
            <div>
              {res?.timetable?.staffs?.map((staff) => (
                <Tag {...(is_substitute_schedule && { color: "red", style: { textDecoration: "line-through" } })} key={`${staff?.id}_timetable`}>
                  {staff?.name}
                </Tag>
              ))}
              {is_substitute_schedule && (
                <>
                  <ArrowRightOutlined className="me-2" />
                  {res?.substitute_staffs?.map((subs) => (
                    <Tag color="green" key={`${subs?.id}_subs`}>
                      {subs?.name}
                    </Tag>
                  ))}
                </>
              )}
            </div>
          ),
          attendance: (
            <div className="fw-bold">
              <span style={{ color: colorSuccess }}>
                <UserAddOutlined className="mx-2" /> {res?.present_count}
              </span>
              <span style={{ color: colorError }}>
                <UserDeleteOutlined className="mx-2" /> {res?.absent_count}
              </span>
            </div>
          ),
          status: res?.status?.value,
          action:
            is_substitute_schedule && !is_my_hour ? (
              "-"
            ) : (
              <Link to={`/divider/schedule/schedules/detail/${res?.id}`}>
                <EyeFilled style={{ color: colorPrimary, fontSize: 20 }} className="me-3 cp" />
              </Link>
            ),
        };
      });
    } catch (error) {
      console.error(error);
    }
  }, [data, info]);

  return { isLoading, columns, isFetching, sch_data, setSearch, date, data };
}
