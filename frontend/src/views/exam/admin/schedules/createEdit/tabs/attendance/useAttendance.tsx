import { useMutation, useQuery } from "@tanstack/react-query";
import { message } from "antd";
import { isEmpty } from "lodash";
import { useEffect, useMemo, useState } from "react";
import axiosInstance from "src/axiosInstance";
import { CheckBoxCmp } from "src/components/styled";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";

const updateAttendance = async ({ attendance, exam_timetable_id }) => {
  if ([attendance, exam_timetable_id].some(isEmpty)) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.post(`api/exam/update-attendance/${exam_timetable_id}`, { attendance });
  return response;
};

const getAttendance = async ({ exam_timetable_id }) => {
  if (!exam_timetable_id) return {};
  const response = await axiosInstance.get(`api/exam/attendance/${exam_timetable_id}`);
  return response;
};

export default function useAttendance({ exam_timetable_id, students }) {
  const [selected, setSelected] = useState([]);

  const { mutate: updateAttendanceMutate, isPending: isLoadingUpdateAttendance } = useMutation({ mutationKey: ["update/attendance"], mutationFn: updateAttendance });
  const { data: attendance, isLoading: isLoadingAttendance } = useQuery({ queryKey: ["get/exam-attendance"], queryFn: () => getAttendance({ exam_timetable_id }) });

  let isAllSelected = useMemo(() => {
    try {
      return students?.response?.length === selected?.length;
    } catch (error) {
      console.error(error);
    }
  }, [selected, students]);

  let columns = [
    {
      dataIndex: "s.no",
      title: (
        <div>
          <CheckBoxCmp
            checked={isAllSelected}
            onChange={() => {
              if (isAllSelected) setSelected([]);
              else setSelected(() => students?.response?.map((res) => res?.id));
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
      dataIndex: "gender",
      title: "Gender",
    },
  ];

  const handleSelect = ({ id }) => {
    setSelected((tmp) => {
      let prev = [...tmp];
      if (prev?.includes(id)) {
        let index = prev?.indexOf(id);
        prev?.splice(index, 1);
      } else prev?.push(id);
      return prev;
    });
  };

  let dataSource = useMemo(() => {
    try {
      return students?.response?.map((student, index) => {
        return {
          id: student?.id,
          "s.no": (
            <div>
              <CheckBoxCmp
                checked={selected?.includes(student?.id)}
                // onChange={() =>handleSelect({id:student?.id})}
                className="me-2"
              />
              {index + 1}
            </div>
          ),
          name: (
            <div>
              <img src={student?.applicant?.image} style={{ height: 50, width: 50, borderRadius: 50 }} /> &nbsp; &nbsp;
              {student?.applicant?.name}
            </div>
          ),
          roll_no: student?.roll_no,
          gender: student?.applicant?.gender?.value,
        };
      });
    } catch (error) {
      console.error(error);
    }
  }, [students, selected]);

  let count = useMemo(() => {
    try {
      return attendance?.response?.reduce(
        (acc, cur) => {
          if (cur?.is_present) acc["present"] += 1;
          else acc["absent"] += 1;
          return acc;
        },
        { present: 0, absent: 0 }
      );
    } catch (error) {
      console.error(error);
    }
  }, [attendance]);

  console.log("####### count ######", count);

  const handleSaveAttendance = () => {
    try {
      let payload = { exam_timetable_id };

      payload["attendance"] = students?.response?.reduce?.(
        (acc, cur) => {
          if (selected?.includes(cur?.id)) acc["absent"]?.push(cur?.id);
          else acc["present"]?.push(cur?.id);
          return acc;
        },
        { present: [], absent: [] }
      );
      updateAttendanceMutate(payload, {
        onSuccess: () => {
          message.success("Attendance updated successfully");
        },
        onError: (error) => {
          message.error(error?.error);
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  const loadPrevAttendance = () => {
    try {
      if (!isEmpty(attendance?.response))
        setSelected(() => {
          return attendance?.response?.filter((res) => !res?.is_present)?.map((res) => res?.student_id);
        });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadPrevAttendance();
  }, [attendance]);

  return { columns, dataSource, handleSelect, handleSaveAttendance, isLoadingUpdateAttendance, isLoadingAttendance, count };
}
