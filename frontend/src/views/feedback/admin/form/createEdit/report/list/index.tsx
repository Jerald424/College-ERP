import { Breadcrumb, Table } from "antd";
import { CardCmp } from "src/components/layouts/container";
import useApplicant from "./useList";
import FormWithHook from "src/components/layouts/form";
import { NavLink, useNavigate } from "react-router-dom";

export default function FeedbackForm() {
  const { isLoading, columns, dataSource, pagination, setPagination, total_count, control, form_data, data } = useApplicant();
  const navigate = useNavigate();

  return (
    <div>
      <Breadcrumb
        className="ms-3 mb-2"
        items={[
          { title: <NavLink to={"/divider/feedback/form"}> Feedback Form </NavLink> },
          { title: <NavLink to={`/divider/feedback/form/detail?id=${data?.response?.form?.id}`}> Feedback Form </NavLink> },
          { title: "Answer Feedback" },
        ]}
      />
      <CardCmp
        title={
          <div>
            <span className="me-3">Feedback Form</span>
          </div>
        }
      >
        <FormWithHook is_edit={false} className="grid-2" control={control} data={form_data} />

        <Table
          onRow={(item) => {
            return {
              className: "cp",
              onClick: () => navigate(`/divider/feedback/user/feedback-list/detail/${data?.response?.form?.id}?user_id=${item?.id}`),
            };
          }}
          className="mt-3"
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
