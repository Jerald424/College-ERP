import { useMutation, useQuery } from "@tanstack/react-query";
import { message, Tag } from "antd";
import { isEmpty, isObject } from "lodash";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import axiosInstance from "src/axiosInstance";
import { CheckBoxWithHook } from "src/components/styled";

const getPassenger = async ({ session_id }) => {
  if (!session_id) return {};
  const response = await axiosInstance.get(`api/transport/attendance-passengers/${session_id}`);
  return response;
};

const updateAttendance = async ({ attendance }) => {
  const response = await axiosInstance.post("/api/transport/attendance", { attendance });
  return response;
};

const getAttendance = async ({ schedule_id }) => {
  if (!schedule_id) return {};
  const response = await axiosInstance.get(`api/transport/attendance/${schedule_id}`);
  return response;
};

export default function useAttendance({ session_id, schedule_id, fetchSchedule }) {
  const { control, handleSubmit, reset, watch } = useForm();

  const { mutate: getPassengerMutate, isPending: isLoadingPassenger, data: passengers } = useMutation({ mutationKey: ["get/passenger"], mutationFn: getPassenger });
  const { mutate: updateAttendanceMutate, isPending: isLoadingUpdateAttendance } = useMutation({ mutationKey: ["update/attendance"], mutationFn: updateAttendance });
  const { data: attendance, isLoading: isLoadingAttendance, refetch: refetchAttendance } = useQuery({ queryKey: ["get/attendance", schedule_id], queryFn: () => getAttendance({ schedule_id }) });

  const columns = [
    {
      dataIndex: "s.no",
      title: "#",
      align: "center",
    },
    {
      dataIndex: "select",
      title: "",
    },
    {
      dataIndex: "name",
      title: "Name",
    },
    {
      dataIndex: "type",
      title: "Type",
    },
  ];

  const user_by_attendance = useMemo(() => {
    try {
      let value = attendance?.response?.reduce(
        (acc, cur) => {
          acc["id_by_attendance"][cur?.user_id] = cur;
          acc["user_by_status"][String(cur?.user_id)] = cur?.status == "absent" ? false : true;
          return acc;
        },
        { id_by_attendance: {}, user_by_status: {} }
      );

      reset(value?.user_by_status);
      return value?.id_by_attendance;
    } catch (error) {
      console.error(error);
    }
  }, [attendance]);

  let dataSource = useMemo(() => {
    try {
      return passengers?.response?.map((res, index) => {
        let is_student = res?.student_id;
        return {
          "s.no": index + 1,
          name: (
            <div>
              <img src={is_student ? res?.student?.applicant?.image : res?.staff?.image} style={{ height: 40, width: 40, objectFit: "cover", borderRadius: 50 }} /> &nbsp;&nbsp;&nbsp;
              {is_student ? `${res?.student?.applicant?.name} (${res?.student?.roll_no})` : res?.staff?.name}
            </div>
          ),
          type: <Tag color={is_student ? "blue-inverse" : "cyan-inverse"}>{is_student ? "Student" : "Staff"}</Tag>,
          select: <CheckBoxWithHook control={control} name={`${res?.id}`} />,
        };
      });
    } catch (error) {
      console.error(error);
    }
  }, [passengers]);

  const onSave = (data) => {
    try {
      if (isObject(data) && !isEmpty(data)) {
        let attendance = {
          schedule_id,
        };
        attendance["user"] = passengers?.response?.reduce((acc, cur) => {
          let obj = { user_id: cur?.id };
          let prev_attendance = user_by_attendance?.[cur?.id];
          if (prev_attendance) obj["id"] = prev_attendance?.id;
          if (data?.[cur?.id]) obj["status"] = "present";
          else obj["status"] = "absent";
          acc.push(obj);
          return acc;
        }, []);
        console.log("####### ATTENDANCE ######", attendance);
        updateAttendanceMutate(
          { attendance },
          {
            onSuccess() {
              message.success("Attendance saved successfully");
            },
            onError(error) {
              message.error(error?.error);
            },
            onSettled() {
              refetchAttendance();
              fetchSchedule();
            },
          }
        );
      } else message.info("No changes");
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (session_id) getPassengerMutate({ session_id });
  }, [session_id]);

  return { columns, dataSource, isLoadingPassenger, handleSubmit: handleSubmit(onSave), isLoadingAttendance, isLoadingUpdateAttendance };
}
