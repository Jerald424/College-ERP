import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";
import { getExamConfigWithId } from "../../examConfig/createEdit/useCreate";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import { message } from "antd";

const conductedExams = async ({ exam_config_id }) => {
  if (!exam_config_id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get(`api/exam/conducted-exams/${exam_config_id}`);
  return response?.response;
};

const updateExamResult = async ({ exam_result }) => {
  //   {
  //     exam_result:{
  //         exam_config_id:number;
  //         student:[
  //             {
  //                 student_id:number;
  //                 course_id:number;
  //                 internal_mark:number;
  //                 external_mark:number
  //             }
  //         ]
  //     }
  // }
  if (!exam_result?.exam_config_id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.post("/api/exam/update-exam-result", { exam_result });
  return response;
};

const examResult = async ({ exam_config_id }) => {
  if (!exam_config_id) return {};
  const response = await axiosInstance.get(`api/exam/exam-result/${exam_config_id}`);
  return response;
};

export default function useGenerate() {
  const exam_config_id = useParams()?.exam_config_id;
  const { Modal, setIsOpen } = useConfirmationModal();

  const { data: conducted_exams, isLoading: isLoadingConductedExam } = useQuery({ queryKey: ["get/conducted-exam", exam_config_id], queryFn: () => conductedExams({ exam_config_id }) });
  const { data: exam_config, isLoading: isLoadingExamConfig } = useQuery({
    queryKey: ["get/exam-config/id", exam_config_id],
    queryFn: () => getExamConfigWithId({ id: exam_config_id }),
  });
  const { mutate: updateExamResultMutate, isPending: isLoadingUpdateExam } = useMutation({ mutationKey: ["update/exam-result"], mutationFn: updateExamResult });
  const { data: result, refetch: refetchGetExamResult } = useQuery({ queryKey: ["exam/result", exam_config_id], queryFn: () => examResult({ exam_config_id }) });

  let result_by_student_course = useMemo(() => {
    try {
      return result?.response?.reduce((acc, cur) => {
        let key = `${cur?.student_id}_${cur?.course_id}`;
        acc[key] = cur;
        return acc;
      }, {});
    } catch (error) {
      console.error(error);
    }
  }, [result]);

  let exam_type = useMemo(() => {
    try {
      return conducted_exams?.reduce((acc, cur) => {
        if (!acc[cur?.type?.id]) acc[cur?.type?.id] = [];
        acc[cur?.type?.id]?.push(cur);
        return acc;
      }, {});
    } catch (error) {
      console.error(error);
    }
  }, [conducted_exams]);

  const handleGenerateResult = () => {
    setIsOpen(false);
    let exam_result = {
      exam_config_id: +exam_config_id,
    };
    let student_by_mark = conducted_exams?.reduce((acc, cur) => {
      cur?.exam_timetable?.forEach((tt) => {
        tt?.exam_mark?.forEach((exam) => {
          let std_course_key = `${exam?.student_id}_${tt?.course?.id}`;
          if (!acc[std_course_key]) acc[std_course_key] = { internal: [], external: [] };
          if (cur?.type?.id == "internal") acc[std_course_key]?.internal?.push(exam);
          else acc[std_course_key]?.external?.push(exam);
        });
      });
      return acc;
    }, {});
    let marks = Object.entries(student_by_mark)?.reduce((acc, [key, value]) => {
      let prev_result = result_by_student_course?.[key];
      let [student_id, course_id] = key?.split("_");
      let object = {
        student_id: +student_id,
        course_id: +course_id,
      };
      if (prev_result) object["id"] = prev_result?.id;
      object["internal_mark"] = +(value?.internal?.reduce((acc, cur) => (acc += cur?.mark || 0), 0) / value?.internal?.length || 0)?.toFixed(1);
      object["external_mark"] = +(value?.external?.reduce((acc, cur) => (acc += cur?.mark || 0), 0) / value?.external?.length || 0)?.toFixed(1);
      acc.push(object);
      return acc;
    }, []);
    exam_result["student"] = marks;
    console.log("marks: ", exam_result);
    updateExamResultMutate(
      { exam_result },
      {
        onError: (error) => {
          message.error(error?.error);
        },
        onSuccess: () => {
          message.success("Marks updated successfully");
        },
        onSettled: () => {
          refetchGetExamResult();
        },
      }
    );
  };

  return { exam_type, isLoadingConductedExam, exam_config, isLoadingExamConfig, Modal, setIsOpen, handleGenerateResult, isLoadingUpdateExam };
}
