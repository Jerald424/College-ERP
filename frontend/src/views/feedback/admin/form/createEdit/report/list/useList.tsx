import { AimOutlined } from "@ant-design/icons";
import { Tag } from "antd";
import { isEmpty } from "lodash";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { formData } from "src/components/layouts/form";
import { Icon } from "src/components/styled";
import useFetchPaginatedData from "src/hooks/table/useFetchPaginated";
import { useColors } from "src/redux/hooks";

export default function useApplicant() {
  const { form_id } = useParams();
  const { colorPrimary } = useColors();
  const { control, reset } = useForm();

  const {
    data: { data, isPending },
    paginate: { pagination, total_count, setPagination },
  } = useFetchPaginatedData({ url: `api/feedback/user-by-feedback/${form_id}` });

  const columns = [
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
      dataIndex: "no_answer",
      title: "No of answers",
    },
    {
      dataIndex: "actions",
      title: "Actions",
      align: "center",
    },
  ];

  let dataSource = useMemo(() => {
    try {
      let form_ques_length = data?.response?.form?.form_questions?.length;
      return data?.response?.rows?.map((res, index) => {
        let is_student = !!res?.student_id;
        return {
          ...res,
          "s.no": <div>{index + 1}</div>,
          name: (
            <div>
              <img src={is_student ? res?.student?.applicant?.image : res?.staff?.image} style={{ height: 50, width: 50, borderRadius: "50%", objectFit: "cover" }} /> &nbsp;&nbsp;&nbsp;
              {is_student ? res?.student?.applicant?.name : res?.staff?.name}
            </div>
          ),
          no_answer: (
            <div>
              {res?.feedback_answers?.length} &nbsp;&nbsp;
              {form_ques_length == res?.feedback_answers?.length && <Icon className="fa-solid fa-circle-check text-success" />}
            </div>
          ),
          actions: (
            <div>
              <AimOutlined style={{ color: colorPrimary, fontSize: 20 }} className="me-3 cp" />
            </div>
          ),
        };
      });
    } catch (error) {
      console.error("error: ", error);
    }
  }, [data]);

  let form_data: formData = [
    {
      label: "No.of Questions",
      name: "no_of_questions",
      type: "input_box",
      rules: { required: "Name is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df" },
      labelProps: { className: "f1" },
    },
  ];

  let loadForm = () => {
    reset((prev) => ({
      ...prev,
      no_of_questions: <Tag color="blue-inverse">{data?.response?.form?.form_questions?.length} </Tag>,
    }));
  };

  useEffect(() => {
    if (!isEmpty(data)) loadForm();
  }, [data]);

  return { isLoading: isPending, columns, dataSource, pagination, setPagination, total_count, control, form_data, data };
}
