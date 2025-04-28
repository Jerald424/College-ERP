import { useMutation, useQuery } from "@tanstack/react-query";
import { message } from "antd";
import { isEmpty } from "lodash";
import { useEffect, useMemo, useState } from "react";
import axiosInstance from "src/axiosInstance";
import { CheckBoxCmp } from "src/components/styled";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";

const getStudents = async ({ schedule_id }) => {
  if (!schedule_id) return {};
  const response = await axiosInstance.get(`api/schedule/students/${schedule_id}`);
  return response?.response;
};

const updateAttendance = async ({ students, schedule_id }) => {
  if (!schedule_id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.post(`api/schedule/update-attendance/${schedule_id}`, { students });
  return response;
};

export default function useStudent({ schedule_id, refetchSchedule, attendance }: { schedule_id: number; refetchSchedule: () => void; attendance: any }) {
  const [selected, setSelected] = useState([]);

  const { data: students, isLoading: isLoadingStudents } = useQuery({ queryKey: ["get/students"], queryFn: () => getStudents({ schedule_id }) });
  const { mutate: updateAttendanceMutate, isPending: isLoadingUpdateAttendance } = useMutation({ mutationKey: ["update/attendance"], mutationFn: updateAttendance });

  let isAllSelected = useMemo(() => {
    try {
      return students?.length === selected?.length;
    } catch (error) {
      console.error(error);
    }
  }, [selected, students]);

  let columns = [
    {
      dataIndex: "#",
      title: (
        <div>
          <CheckBoxCmp
            checked={isAllSelected}
            onChange={() => {
              if (isAllSelected) setSelected([]);
              else setSelected(() => students?.map((res) => res?.id));
            }}
            className="me-2"
          />{" "}
          #
        </div>
      ),
      align: "center",
    },
    {
      dataIndex: "name",
      title: "Name",
    },
    {
      dataIndex: "roll_no",
      title: "Roll No",
    },
    {
      dataIndex: "class",
      title: "Class",
    },
    {
      dataIndex: "gender",
      title: "Gender",
    },
  ];

  let dataSource = useMemo(() => {
    try {
      return students?.map((std, index) => {
        return {
          "#": (
            <div>
              <CheckBoxCmp
                checked={selected?.includes(std?.id)}
                onChange={() =>
                  setSelected((tmp) => {
                    let prev = [...tmp];
                    if (prev?.includes(std?.id)) {
                      let index = prev?.indexOf(std?.id);
                      prev?.splice(index, 1);
                    } else prev?.push(std?.id);
                    return prev;
                  })
                }
                className="me-2"
              />
              {index + 1}
            </div>
          ),
          name: (
            <div>
              <img src={std?.applicant?.image} style={{ height: 50, width: 50, borderRadius: 50 }} />
              &nbsp;&nbsp; {std?.applicant?.name}
            </div>
          ),
          roll_no: std?.roll_no,
          class: std?.class?.name,
          gender: std?.applicant?.gender?.value,
        };
      });
    } catch (error) {
      console.error(error);
    }
  }, [students, selected]);

  const onSaveAttendance = () => {
    try {
      const students_payload = students?.map((res) => ({ student_id: res?.id, status: selected?.includes(res?.id) ? "absent" : "present" }));
      updateAttendanceMutate(
        { schedule_id, students: students_payload },
        {
          onError: (error) => {
            message.error(error?.error);
          },
          onSuccess: () => {
            message.success("Attendance updated successfully");
          },
          onSettled: () => {
            refetchSchedule?.();
          },
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!isEmpty(attendance)) {
      setSelected(() => attendance?.filter((res) => res?.status?.id == "absent")?.map((res) => res?.studentId));
    }
  }, [attendance]);
  return { columns, dataSource, onSaveAttendance, isLoadingUpdateAttendance, isLoadingStudents };
}
