import { AimOutlined } from "@ant-design/icons";
import { Breadcrumb, Table, Tag } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { CardCmp } from "src/components/layouts/container";
import { LoaderCmp } from "src/components/styled";
import useApplicant from "./useApplicantIndex";

export default function ExamResultList() {
  const { isLoading, columns, dataSource, pagination, setPagination, total_count, isFetching, isLoadingExamConfig, exam_config_id } = useApplicant();
  const navigate = useNavigate();

  return (
    <div>
      <Breadcrumb className="ms-3 mb-2" items={[{ title: "Exam Config", onClick: () => navigate(-1) }, { title: "Result" }]} />
      <CardCmp
        title={
          <div>
            <span className="me-3">Exam Result</span>
            <Link to={`/divider/exam/generate-result/${exam_config_id}`}>
              <Tag className="cp" color={"blue"} icon={<AimOutlined />}>
                Generate Result
              </Tag>
            </Link>
            <LoaderCmp style={{ visibility: isFetching || isLoadingExamConfig ? "visible" : "hidden" }} />
          </div>
        }
      >
        <Table
          size="small"
          loading={isLoading}
          // bordered
          columns={columns}
          dataSource={dataSource}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: total_count,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20", "30", "40", "100", "200"],
          }}
          onChange={setPagination}
        />
      </CardCmp>
    </div>
  );
}
