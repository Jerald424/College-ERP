import { useQuery } from "@tanstack/react-query";
import { Table } from "antd";
import { useMemo } from "react";
import { SubHeading } from "src/components/styled";
import { DropdownWithHK } from "src/components/styled/inputs/dropdown";
import { getStaffList } from "src/views/base/users/create/useCreate";

export default function Substitutions({ isLoadingSchedule, schedules, control, isLoadingSubstitute, isEdit }) {
  const { data: staff, isLoading } = useQuery({ queryKey: ["get/staff"], queryFn: getStaffList });

  const columns = [
    {
      dataIndex: "s.no",
      title: "#",
      align: "center",
    },
    {
      dataIndex: "date",
      title: "Date",
    },
    {
      dataIndex: "hour",
      title: "Hour",
    },
    {
      dataIndex: "course",
      title: "Course",
    },
    {
      dataIndex: "schedule_status",
      title: "Schedule Status",
    },
    {
      dataIndex: "staff",
      title: "Staff",
    },
  ];

  let dataSource = useMemo(() => {
    try {
      return schedules?.response?.map((schedule, index) => {
        return {
          "s.no": index + 1,
          date: schedule?.date,
          hour: schedule?.timetable?.hour?.name,
          course: schedule?.timetable?.course?.name,
          schedule_status: schedule?.status?.value,
          staff: (
            <DropdownWithHK
              isView={!isEdit}
              dropdownProps={{
                options: staff?.rows,
                optional_label: "name",
                optional_value: "id",
              }}
              control={control}
              name={`substitute.${String(schedule?.id)}`}
            />
          ),
        };
      });
    } catch (error) {
      console.error(error);
    }
  }, [schedules, staff, isLoading, isEdit]);

  return (
    <div className="mt-3">
      <SubHeading>Substitutions</SubHeading>
      <Table size="small" loading={isLoadingSchedule || isLoadingSubstitute} bordered columns={columns} dataSource={dataSource} />
    </div>
  );
}
