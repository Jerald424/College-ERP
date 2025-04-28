import { useMutation, useQuery } from "@tanstack/react-query";
import { message, Tag } from "antd";
import { isEmpty } from "lodash";
import { createRef, useEffect, useMemo, useState } from "react";
import axiosInstance from "src/axiosInstance";
import { InputBox } from "src/components/styled";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";

const updateMark = async ({ mark_entry }) => {
  if ([mark_entry?.exam_timetable_id, mark_entry?.marks].some((res) => !!!res)) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.post(`api/exam/timetable/mark-entry`, { mark_entry });
  return response;
};

const getMarks = async ({ exam_timetable_id }) => {
  if (!exam_timetable_id) return {};
  const response = await axiosInstance.get(`api/exam/timetable/marks/${exam_timetable_id}`);
  return response?.response;
};

export default function useMarkEntry({ students, exam_timetable }) {
  const [marks, setMarks] = useState({});
  const { Modal, setIsOpen } = useConfirmationModal();
  const [isEdit, setIsEdit] = useState(false);

  const { mutate: updateMarkMutate, isPending: isLoadingUpdateMark } = useMutation({ mutationFn: updateMark, mutationKey: ["update/exam-mark"] });
  const { mutate: getMarksMutate, isPending: isLoadingExamMark } = useMutation({ mutationKey: ["get/exam-mark", exam_timetable], mutationFn: getMarks });

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
      dataIndex: "mark",
      title: "Mark",
    },
    {
      dataIndex: "status",
      title: "Status",
      align: "center",
    },
  ];

  let refs = useMemo(() => {
    try {
      return new Array(students?.response?.length).fill(createRef());
    } catch (error) {
      console.error(error);
    }
  }, [students]);

  let marks_obj = useMemo(() => {
    let type = exam_timetable?.exam?.type;
    return {
      max: type == "internal" ? exam_timetable?.exam?.exam_config?.internal : exam_timetable?.exam?.exam_config?.external,
      pass: type == "internal" ? exam_timetable?.exam?.exam_config?.internal_pass_mark : exam_timetable?.exam?.exam_config?.external_pass_mark,
    };
  }, [exam_timetable]);

  const handleEnterMark = ({ e, student_id }) => {
    try {
      let val = +e?.target?.value;
      if (val <= marks_obj?.max)
        setMarks((prev) => {
          let tmp = { ...prev };
          if (!tmp?.[student_id]) tmp[student_id] = {};
          Object.assign(tmp?.[student_id], { mark: val });
          return tmp;
        });
    } catch (error) {
      console.error(error);
    }
  };

  let dataSource = useMemo(() => {
    try {
      return students?.response?.map((student, index) => {
        let student_id = student?.id;
        let mark = marks?.[student_id]?.mark;
        let is_pass = mark >= marks_obj?.pass ? true : false;
        let is_entered = marks?.[student_id];

        let ref = refs?.[index];
        let next_ref = refs?.[index + 1];

        return {
          id: student_id,
          "s.no": index + 1,
          name: (
            <div>
              <img src={student?.applicant?.image} style={{ height: 50, width: 50, borderRadius: 50 }} /> &nbsp; &nbsp;
              {student?.applicant?.name}
            </div>
          ),
          roll_no: student?.roll_no,
          mark: isEdit ? (
            <InputBox
              onKeyDown={(e) => {
                if (e?.code == "Enter" && !!next_ref) next_ref?.current?.focus?.();
              }}
              reactRef={ref}
              type="number"
              value={mark}
              onChange={(e) => handleEnterMark({ e, student_id })}
            />
          ) : (
            mark
          ),
          status: <Tag color={is_entered ? (is_pass ? "green" : "red") : "gold"}>{is_entered ? (is_pass ? "Pass" : "Fail") : "Not marked"}</Tag>,
        };
      });
    } catch (error) {
      console.error(error);
    }
  }, [students, marks_obj, marks, refs, isEdit]);

  const getMarkFn = () => {
    getMarksMutate(
      { exam_timetable_id: exam_timetable?.id },
      {
        onSuccess: (data) => {
          loadPrevMark(data);
        },
      }
    );
  };

  const handleSave = () => {
    try {
      setIsOpen(false);
      let mark_entry = { exam_timetable_id: exam_timetable?.id };
      mark_entry["marks"] = Object.entries(marks)?.map(([student_id, value]) => ({ student_id: +student_id, ...value }));
      console.log("mark_entry: ", mark_entry);
      updateMarkMutate(
        { mark_entry },
        {
          onError: (error) => {
            message.error(error?.error ?? String(error));
          },
          onSuccess: () => {
            message.success("Marks updates successfully");
            setIsEdit(false);
          },
          onSettled: () => {
            getMarkFn();
          },
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  const loadPrevMark = (e_mark) => {
    try {
      if (isEmpty(e_mark)) return;
      let prev_mark = e_mark?.marks?.reduce((acc, cur) => {
        acc[cur?.student_id] = cur;
        return acc;
      }, {});
      setMarks(prev_mark);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!isEmpty(exam_timetable)) getMarkFn();
  }, [exam_timetable]);

  return { columns, dataSource, marks_obj, Modal, setIsOpen, handleSave, isLoadingUpdateMark, isEdit, setIsEdit, getMarkFn, isLoadingExamMark };
}
