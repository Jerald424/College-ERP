import { useMutation, useQuery } from "@tanstack/react-query";
import { message } from "antd";
import { useMemo } from "react";
import axiosInstance from "src/axiosInstance";
import { makeJSDateToYYYYMMDD } from "src/functions/handleDate";
import { useColors } from "src/redux/hooks";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";

const getClassStudent = async ({ class_id }) => {
  if (!class_id) return {};
  const response = await axiosInstance.get(`api/exam/exam-room-allocate/class-students/${class_id}`);
  return response;
};

const getAllocatedExamRoom = async ({ exam_room_id, exam_timetable_id, date, exam_time_id }) => {
  if ([exam_room_id, exam_timetable_id, date, exam_time_id].some((res) => !res)) return {};
  const response = await axiosInstance.get(`api/exam/already-room-allocated/${exam_room_id}/${date}/${exam_time_id}`);
  return response;
};

const createAllocate = async ({ exam_room_allocate }) => {
  if ([exam_room_allocate?.exam_timetable_id, exam_room_allocate?.students].some((res) => !res)) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.post(`api/exam/exam-room-allocate`, { exam_room_allocate });
  return response;
};

export default function useAllocateRoom({ class_id, exam_room_id, exam_timetable_id, date, exam_time_id, selected_room, setIsOpenAllocateRoom }) {
  const { colorSuccess } = useColors();

  const { data: class_students } = useQuery({ queryKey: ["get/class-students", class_id], queryFn: () => getClassStudent({ class_id }) });
  const { data: allocatedRooms, refetch: refetchGetAlloted } = useQuery({
    queryKey: ["get/allocated-room", exam_room_id, exam_timetable_id, date, exam_time_id],
    queryFn: () => getAllocatedExamRoom({ exam_room_id, exam_timetable_id, date: makeJSDateToYYYYMMDD(date), exam_time_id }),
  });
  const { mutate: createAllocateMutate, isPending: isLoadingAllocate } = useMutation({ mutationKey: ["create/exam-allocate"], mutationFn: createAllocate });

  let prev_allocated = useMemo(() => {
    try {
      return allocatedRooms?.response?.reduce(
        (acc, cur) => {
          acc["room_by_student"][`${cur?.row}_${cur?.column}`] = cur?.student;
          acc["student_by_room"][cur?.student_id] = cur;
          return acc;
        },
        { student_by_room: {}, room_by_student: {} }
      );
    } catch (error) {
      console.error(error);
    }
  }, [allocatedRooms]);

  let studentRooms = useMemo(() => {
    try {
      if ([class_students, selected_room, class_students].some((res) => !res)) return;
      let available_room = [];
      new Array(selected_room?.row).fill(1)?.forEach((_, row_index) => {
        new Array(selected_room?.column)?.fill(1).forEach((_, column_index) => {
          available_room?.push(`${row_index + 1}_${column_index + 1}`);
        });
      });
      return class_students?.response?.reduce(
        (acc, cur, index) => {
          let room = available_room?.[index];
          let prev = prev_allocated?.room_by_student[room];
          if (room && !prev) {
            acc["room_by_student"][room] = cur;

            let [row, column] = room?.split("_")?.map(Number);
            acc["student_by_room"][cur?.id] = { column, row, student: cur };
          }
          return acc;
        },
        { student_by_room: {}, room_by_student: {} }
      );
    } catch (error) {
      console.error(error);
    }
  }, [class_students, selected_room, class_students, prev_allocated]);

  let columns = [
    {
      dataIndex: "s.no",
      title: "#",
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
      dataIndex: "row",
      title: "Row",
      align: "center",
    },
    {
      dataIndex: "column",
      title: "Column",
      align: "center",
    },
  ];

  let dataSource = useMemo(() => {
    try {
      return class_students?.response?.map((student, index) => {
        let rc = studentRooms?.student_by_room?.[student?.id];
        let prev = prev_allocated?.student_by_room?.[student?.id];
        console.log("prev: ", prev);
        return {
          "s.no": index + 1,
          name: student?.applicant?.name,
          roll_no: student?.roll_no,
          row: prev ? <span style={{ color: colorSuccess }}>{prev?.row}</span> : rc?.row,
          column: prev ? <span style={{ color: colorSuccess }}>{prev?.column}</span> : rc?.column || "-",
        };
      });
    } catch (error) {
      console.error(error);
    }
  }, [class_students, studentRooms, prev_allocated]);

  const handleAllocate = () => {
    try {
      let students = Object.entries(studentRooms?.student_by_room)?.reduce((acc, [student_id, obj]) => {
        acc.push({
          row: obj?.row,
          column: obj?.column,
          student_id: +student_id,
        });
        return acc;
      }, []);
      let exam_room_allocate = {
        exam_timetable_id: +exam_timetable_id,
        students,
      };
      createAllocateMutate(
        { exam_room_allocate },
        {
          onError: (error) => {
            message.error(error?.error);
          },
          onSuccess: () => {
            message.success("Room allocated successfully");
            setIsOpenAllocateRoom(false);
          },
          onSettled: () => {
            refetchGetAlloted();
          },
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  return { class_students, columns, dataSource, studentRooms, handleAllocate, prev_allocated, isLoadingAllocate };
}
