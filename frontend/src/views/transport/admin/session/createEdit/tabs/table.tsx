import { Table } from "antd";
import { useMemo } from "react";
import { CheckBoxWithHook, Para } from "src/components/styled";

export default function UsersTable({ users, type, control, is_edit }) {
  const columns = [
    {
      dataIndex: "select",
      title: "",
    },
    {
      dataIndex: "name",
      title: "Name",
    },
  ];

  let dataSource = useMemo(() => {
    try {
      let data = users?.response?.reduce(
        (acc, cur) => {
          let is_student = cur?.student_id;
          let obj = {
            select: <CheckBoxWithHook disabled={!is_edit} control={control} name={`${type}.${cur?.id}`} />,
          };
          if (is_student) {
            Object.assign(obj, {
              name: (
                <div>
                  <img src={cur?.student?.applicant?.image} style={{ height: 40, width: 40, borderRadius: 50, objectFit: "cover" }} /> &nbsp;&nbsp;&nbsp;
                  {cur?.student?.applicant?.name} ({cur?.student?.roll_no})
                </div>
              ),
            });
            acc.student.push(obj);
          } else {
            Object.assign(obj, {
              name: (
                <div>
                  <img src={cur?.staff?.image} style={{ height: 40, width: 40, borderRadius: 50, objectFit: "cover" }} /> &nbsp;&nbsp;&nbsp;
                  {cur?.staff?.name}
                </div>
              ),
            });

            acc.staff.push(obj);
          }
          return acc;
        },
        { student: [], staff: [] }
      );

      return [
        {
          name: <Para className="fw-bold">Student</Para>,
          children: data?.student,
          key: 1,
        },
        {
          name: <Para className="fw-bold">Staff</Para>,
          children: data?.staff,
          key: 2,
        },
      ];
    } catch (error) {
      console.error(error);
    }
  }, [users, is_edit]);

  return (
    <>
      <Table size="small" columns={columns} dataSource={dataSource} />
    </>
  );
}
