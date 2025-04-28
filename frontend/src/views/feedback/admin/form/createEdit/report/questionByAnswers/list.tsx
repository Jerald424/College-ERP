import { Table, Tag } from "antd";
import { useMemo } from "react";

export default function AnswerList({ data }) {
  let columns = [
    {
      dataIndex: "s.no",
      title: "#",
      align: "center",
    },
    {
      dataIndex: "user",
      title: "User",
    },
    {
      dataIndex: "answer",
      title: "Answer",
    },
  ];

  let dataSource = useMemo(() => {
    try {
      let is_dropdown = ["dropdown-single", "dropdown-multiple"].includes(data?.response?.question?.type?.id);

      return data?.response?.answers?.map((res, index) => {
        let is_student = res?.user?.student_id;
        return {
          "s.no": index + 1,
          user: (
            <div>
              <img src={is_student ? res?.user?.student?.applicant?.image : res?.user?.staff?.image} style={{ height: 30, width: 30, borderRadius: "50%", objectFit: "cover" }} />
              &nbsp;&nbsp;&nbsp;
              {is_student ? res?.user?.student?.applicant?.name : res?.user?.staff?.name}
            </div>
          ),
          answer: is_dropdown
            ? res?.options?.map((res) => (
                <Tag color="blue" key={res?.id}>
                  {res?.name}
                </Tag>
              ))
            : res?.text_answer,
        };
      });
    } catch (error) {
      console.error(error);
    }
  }, [data]);
  return (
    <div className="mt-3">
      <Table className="mb-3" pagination={false} size="small" columns={columns} dataSource={dataSource} />
    </div>
  );
}
