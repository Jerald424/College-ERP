import { Breadcrumb, Table, Tag } from "antd";
import useGenerate from "./useGenerate";
import { CardCmp } from "src/components/layouts/container";
import { ButtonCmp, LoaderCmp, Para, SubHeading } from "src/components/styled";
import { useMemo } from "react";
import { isArray, isObject } from "lodash";
import { NavLink, useNavigate } from "react-router-dom";

export default function GenerateResult() {
  const { exam_type, isLoadingConductedExam, exam_config, isLoadingExamConfig, Modal, setIsOpen, handleGenerateResult, isLoadingUpdateExam } = useGenerate();
  const navigate = useNavigate();

  return (
    <>
      <Breadcrumb className="ms-3 mb-2" items={[{ title: <NavLink to="/divider/exam/config">Exam Config</NavLink> }, { title: "Result", onClick: () => navigate(-1) }, { title: "Generate" }]} />
      <CardCmp className="z-0" title={isLoadingExamConfig ? <LoaderCmp /> : exam_config?.name}>
        <Tag color="blue" className="fw-bold">
          Internal
        </Tag>
        <SepTable exam_config={exam_config} isLoading={isLoadingConductedExam} type="internal" exams={exam_type?.["internal"]} />

        <Tag color="green" className="fw-bold">
          External
        </Tag>
        <SepTable exam_config={exam_config} isLoading={isLoadingConductedExam} type="external" exams={exam_type?.["external"]} />
        <div className="ae">
          <ButtonCmp loading={isLoadingUpdateExam} onClick={() => setIsOpen(true)}>
            Generate Result
          </ButtonCmp>
        </div>
        <Modal description="Generate result" okButtonProps={{ onClick: handleGenerateResult }} />
      </CardCmp>
    </>
  );
}

const SepTable = ({ exams, isLoading, type, exam_config }) => {
  const columns = useMemo(() => {
    try {
      let arr = [
        {
          title: "Name",
          dataIndex: "name",
          // fixed: "left",
        },
      ];
      if (isArray(exams)) arr.push(...exams?.map((exam) => ({ dataIndex: String(exam?.id), title: exam?.name })));
      arr.push({
        dataIndex: "status",
        title: "Status",
        // fixed: "right",
      });
      return arr;
    } catch (error) {
      console.error(error);
    }
  }, [exams]);

  const data = useMemo(() => {
    try {
      let course_by_student = exams?.reduce((acc, cur) => {
        cur?.exam_timetable?.forEach((tt) => {
          let course_key = JSON.stringify(tt?.course);
          if (!acc[course_key]) acc[course_key] = {};

          tt?.exam_mark?.forEach((mark) => {
            let student_key = JSON.stringify(mark?.student);
            if (!acc[course_key][student_key]) acc[course_key][student_key] = [];
            acc[course_key][student_key].push({
              exam_id: cur?.id,
              mark: mark?.mark,
            });
          });
        });
        return acc;
      }, {});

      let result = isObject(course_by_student)
        ? Object.entries(course_by_student)?.reduce((acc, [key, value]) => {
            let course = JSON.parse(key);
            let object = {
              name: <div className="fw-bold">{course?.name}</div>,
              children: [],
              key: course?.id,
            };
            Object.entries(value)?.forEach(([std, exams]) => {
              let student = JSON.parse(std);
              let obj = {
                name: `${student?.applicant?.name || ""}  (${student?.roll_no})`,
              };
              let mark = [];
              exams?.forEach((exam) => {
                obj[String(exam?.exam_id)] = exam?.mark;
                mark.push(+exam?.mark);
              });
              let avg = (mark?.reduce((acc, cur) => (acc += cur || 0), 0) / mark?.length)?.toFixed(1);
              let is_pass = avg >= (type == "internal" ? exam_config?.external_pass_mark : exam_config?.external_pass_mark);
              obj["status"] = (
                <div>
                  {avg}
                  {is_pass ? (
                    <Tag color="green-inverse" className="ms-3">
                      Pass
                    </Tag>
                  ) : (
                    <Tag color="red-inverse" className="ms-3">
                      Fail
                    </Tag>
                  )}
                </div>
              );
              object["children"].push(obj);
            });
            acc.push(object);
            return acc;
          }, [])
        : [];

      return result;
    } catch (error) {
      console.error(error);
    }
  }, [exams, exam_config]);

  return <Table className="mb-3" pagination={false} loading={isLoading} size="small" columns={columns} dataSource={data} />;
};
