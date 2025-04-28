import { Badge, Breadcrumb, Tag } from "antd";
import { CardCmp } from "src/components/layouts/container";
import FormWithHook from "src/components/layouts/form";
import { LoaderWithChildren } from "src/components/styled";
import ScheduleTab from "./tabs";
import useCreate from "./useCreate";

export default function ScheduleEdit() {
  const { control, form_data, record_id, isLoading, schedule, refetchSchedule, attendance, isLoadingAttendance, attendance_summary } = useCreate();

  return (
    <div>
      <Breadcrumb className="ms-3 mb-2" items={[{ title: "Schedule", path: "/divider/schedule/schedules" }, { title: "View" }]} />
      <LoaderWithChildren isLoading={isLoading}>
        <Badge.Ribbon color={schedule?.status?.id == "not_marked" ? "orange" : "green"} text={schedule?.status?.value}>
          <CardCmp title={"Schedule"} className="mt-2">
            <FormWithHook is_edit={false} className="grid-2 gap-1" control={control} data={form_data} />
            {attendance_summary && (
              <div className="mt-2 ae">
                <Tag color="green">Present {attendance_summary?.present}</Tag>
                <Tag color="red">Absent {attendance_summary?.absent}</Tag>
              </div>
            )}
            <ScheduleTab attendance={attendance} isLoadingAttendance={isLoadingAttendance} refetchSchedule={refetchSchedule} schedule_id={record_id} />
          </CardCmp>
        </Badge.Ribbon>
      </LoaderWithChildren>
    </div>
  );
}
