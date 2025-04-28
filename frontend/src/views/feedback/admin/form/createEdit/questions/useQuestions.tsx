import { DeleteOutlined, EyeFilled } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Tag } from "antd";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { useColors } from "src/redux/hooks";

const getQuestions = async () => {
  const response = await axiosInstance.get("/api/feedback/question");
  return response;
};

export default function useQuestions({ watch, reset, is_edit, data }) {
  const { data: questions, isLoading: isLoadingQuestion } = useQuery({ queryKey: ["get/question"], queryFn: getQuestions });
  const { colorError, colorPrimary } = useColors();
  const navigate = useNavigate();

  let columns = useMemo(() => {
    let arr = [
      {
        dataIndex: "s.no",
        title: "#",
      },
      {
        dataIndex: "name",
        title: "Name",
      },
      {
        dataIndex: "type",
        title: "Type",
      },
      {
        dataIndex: "action",
        title: "Action",
        align: "center",
      },
    ];

    return arr;
  }, [is_edit]);

  let question_ids = watch("question_ids");

  const handleRemove = ({ id }) => {
    try {
      reset((prev) => {
        let tmp = Object.assign(prev);
        let index = tmp?.question_ids?.indexOf(id);
        if (index != -1) tmp?.question_ids?.splice(index, 1);
        return tmp;
      });
    } catch (error) {
      console.error(error);
    }
  };

  let selected_questions = useMemo(() => {
    try {
      return questions?.response?.rows
        ?.filter((res) => question_ids?.includes(res?.id))
        ?.map((res, index) => ({
          "s.no": index + 1,
          ...res,
          type: <Tag color="blue">{res?.type?.value}</Tag>,
          action: res?.id ? (
            is_edit ? (
              <DeleteOutlined onClick={() => handleRemove({ id: res?.id })} style={{ color: colorError, fontSize: 20 }} className=" cp" />
            ) : (
              <EyeFilled onClick={() => navigate(`question/${data?.id}/${res?.id}`)} style={{ color: colorPrimary, fontSize: 20 }} className=" cp" />
            )
          ) : (
            "-"
          ),
        }));
    } catch (error) {
      console.error(error);
    }
  }, [questions, question_ids, is_edit, data]);

  let un_selected_questions = useMemo(() => {
    try {
      return questions?.response?.rows?.filter((res) => !question_ids?.includes(res?.id));
    } catch (error) {
      console.error(error);
    }
  }, [questions, question_ids]);

  return { un_selected_questions, isLoadingQuestion, selected_questions, columns };
}
