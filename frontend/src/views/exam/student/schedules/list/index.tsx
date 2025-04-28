import { Result, Table, Tag } from "antd";
import useSchedules from "./useSchedules";
import { CardCmp } from "src/components/layouts/container";
import { LoaderCmp } from "src/components/styled";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";

export default function StudentExamSchedules() {
  const { error, exam_schedules, columns, isLoading, dataSource, isFetching } = useSchedules();
  const navigate = useNavigate();

  let mark_obj = useMemo(() => {
    if (exam_schedules?.exam?.type?.id == "internal") return { pass: exam_schedules?.exam?.exam_config?.internal_pass_mark, max: exam_schedules?.exam?.exam_config?.internal };
    return { pass: exam_schedules?.exam?.exam_config?.external_pass_mark, max: exam_schedules?.exam?.exam_config?.external };
  }, [exam_schedules]);

  if (error?.error) return <Result status={"403"} subTitle={error?.error} />;
  return (
    <CardCmp
      title={
        <div>
          {exam_schedules?.exam?.name} &nbsp;
          <Tag color={exam_schedules?.exam?.type?.id == "internal" ? "blue" : "magenta"}>{exam_schedules?.exam?.type?.value}</Tag>
          <Tag color={"green"}>Pass: {mark_obj?.pass}</Tag>
          <Tag color={"purple-inverse"}>Max: {mark_obj?.max}</Tag>
          <LoaderCmp style={{ visibility: isFetching ? "visible" : "hidden" }} />
        </div>
      }
    >
      <Table
        onRow={(value) => {
          return {
            onClick: () => navigate(`detail/${value?.id}`),
            className: "cp",
          };
        }}
        size="small"
        loading={isLoading}
        // bordered
        columns={columns}
        dataSource={dataSource}
        pagination={false}
      />
    </CardCmp>
  );
}
