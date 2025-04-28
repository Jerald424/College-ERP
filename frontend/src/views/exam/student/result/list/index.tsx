import { Result, Table } from "antd";
import { CardCmp } from "src/components/layouts/container";
import { LoaderCmp } from "src/components/styled";
import useSchedules from "./useSchedules";

export default function StudentExamResult() {
  const { exam_result, columns, isLoading, dataSource, isFetching } = useSchedules();

  if (exam_result?.error) return <Result status={"403"} subTitle={exam_result?.error} />;
  return (
    <CardCmp
      title={
        <div>
          {exam_result?.response?.name} &nbsp;
          <LoaderCmp style={{ visibility: isFetching ? "visible" : "hidden" }} />
        </div>
      }
    >
      <Table
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
