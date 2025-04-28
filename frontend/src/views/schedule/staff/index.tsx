import { Table } from "antd";
import { CardCmp } from "src/components/layouts/container";
import { DatePickerCmp, LoaderCmp, SubHeading } from "src/components/styled";
import useMySchedules from "./useMySchedules";

export default function StaffMySchedules() {
  const { isLoading, columns, isFetching, sch_data, setSearch, date, data } = useMySchedules();
  return (
    <CardCmp
      title={
        <div>
          My Schedules &nbsp;&nbsp;&nbsp;&nbsp;
          <DatePickerCmp className="me-3" value={date} onChange={(date) => setSearch({ date: date?.format() })} />
          <LoaderCmp className={`d-${isFetching ? "hidden" : "none"}`} />
        </div>
      }
    >
      {data?.calender ? (
        <div>
          <SubHeading>{data?.calender?.title}</SubHeading>
          <div dangerouslySetInnerHTML={{ __html: data?.calender?.event_name?.replace?.("ql-align-center", "text-center") }} />
        </div>
      ) : (
        <Table columns={columns} loading={isLoading} dataSource={sch_data} />
      )}
    </CardCmp>
  );
}
