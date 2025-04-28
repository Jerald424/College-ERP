import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import axiosInstance from "src/axiosInstance";
import { formData } from "src/components/layouts/form";
import { getExamSupportSupportData } from "../examTimetable/createEdit/useCreate";
import { Radio } from "antd";

const getExamTimetable = async ({ exam_id, exam_room_id }) => {
  if (!exam_id || !exam_room_id) return {};
  const response = await axiosInstance.get(`api/exam/get-exam-timetable/${exam_id}/${exam_room_id}`);
  return response;
};

const allotedRoom = async ({ exam_timetable_id }) => {
  if (!exam_timetable_id) return {};
  const response = await axiosInstance.get(`api/exam/get-allocated-room/${exam_timetable_id}`);
  return response;
};

export default function useAllocatedExamRoom() {
  const { control, watch } = useForm();
  const [exam_timetable_id, setExam_timetable_id] = useState();
  const { data: supportData, isLoading: isLoadingSupportData } = useQuery({ queryKey: ["get/allocated-rooms-support-data"], queryFn: getExamSupportSupportData });

  let [exam_id, exam_room_id] = watch(["exam_id", "exam_room_id"]);
  const { data: timetable, isLoading: isLoadingTimetable } = useQuery({ queryKey: ["get/exam-timetable", exam_id, exam_room_id], queryFn: () => getExamTimetable({ exam_id, exam_room_id }) });
  const { data: allotedRoomData, isFetching } = useQuery({ queryKey: ["get/alloted-room", exam_timetable_id], queryFn: () => allotedRoom({ exam_timetable_id }) });
  console.log("allotedRoomData: ", allotedRoomData);

  let form_data: formData = [
    {
      label: "Exam",
      name: "exam_id",
      type: "drop_down",
      rules: { required: "Exam is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
      dropdownProps: {
        options: supportData?.exam,
        optional_label: "name",
        optional_value: "id",
        loading: isLoadingSupportData,
      },
    },

    {
      label: "Exam room",
      name: "exam_room_id",
      type: "drop_down",
      rules: { required: "Exam room is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df mt-1" },
      labelProps: { className: "f1" },
      dropdownProps: {
        options: supportData?.exam_room,
        optional_label: "name",
        optional_value: "id",
      },
    },
  ];

  let selected_room = useMemo(() => {
    try {
      return supportData?.exam_room?.find((res) => res?.id == exam_room_id);
    } catch (error) {
      console.error(error);
    }
  }, [exam_room_id, supportData]);

  let columns = [
    {
      dataIndex: "s.no",
      title: "#",
      align: "center",
    },
    {
      dataIndex: "date",
      title: "Date",
    },
    {
      dataIndex: "exam_time",
      title: "Exam Time",
    },
    {
      dataIndex: "invigilator",
      title: "Invigilator",
    },
    {
      dataIndex: "class",
      title: "Class",
    },
    {
      dataIndex: "course",
      title: "Course",
    },
  ];

  let dataSource = useMemo(() => {
    try {
      return timetable?.response?.map((res, index) => {
        return {
          id: res?.id,
          "s.no": (
            <div>
              <Radio checked={exam_timetable_id == res?.id} /> &nbsp;
              {index + 1}
            </div>
          ),
          date: res?.date,
          exam_time: res?.exam_time?.name,
          invigilator: res?.invigilator?.name,
          class: res?.class?.name,
          course: res?.course?.name,
        };
      });
    } catch (error) {
      console.error(error);
    }
  }, [timetable, exam_timetable_id]);

  let room_data = useMemo(() => {
    try {
      return allotedRoomData?.response?.reduce((acc, cur) => {
        let key = `${cur?.row}_${cur?.column}`;
        acc[key] = cur?.student;
        return acc;
      }, {});
    } catch (error) {
      console.error(error);
    }
  }, [allotedRoomData]);

  return { form_data, control, selected_room, columns, dataSource, isLoadingTimetable, setExam_timetable_id, isFetching, room_data };
}
