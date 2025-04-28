import { CardCmp } from "src/components/layouts/container";
import { DatePickerCmp, LoaderCmp, SubHeading } from "src/components/styled";
import useStudentSession from "./useStudent";
import { Table } from "antd";

export default function StudentMySchedule() {
  const { date, setSearchParams, isLoading, isFetching, dataSource, columns, schedule } = useStudentSession();
  return (
    <CardCmp
      title={
        <div>
          My Schedules &nbsp;&nbsp;&nbsp;&nbsp;
          <DatePickerCmp className="me-3" value={date} onChange={(date) => setSearchParams({ date: date?.format() })} />
          <LoaderCmp className={`d-${isFetching ? "hidden" : "none"}`} />
        </div>
      }
    >
      {schedule?.calender ? (
        <div>
          <SubHeading>{schedule?.calender?.title}</SubHeading>
          <div dangerouslySetInnerHTML={{ __html: schedule?.calender?.event_name }} />
        </div>
      ) : (
        <Table columns={columns} loading={isLoading} dataSource={dataSource} />
      )}
    </CardCmp>
  );
}
