import { Breadcrumb, Table } from "antd";
import useDetailSchedule from "./useDetailSchedule";
import RecordPagination from "src/components/layouts/recordPagination";
import { useNavigate } from "react-router-dom";
import { CardCmp, DividerCmp } from "src/components/layouts/container";
import FormWithHook from "src/components/layouts/form";
import { Icon, LoaderCmp, LoaderWithChildren, Para, SubHeading } from "src/components/styled";
import Ribbon from "antd/es/badge/Ribbon";
import { useColors } from "src/redux/hooks";

export default function StudentExamDetail() {
  const { id, control, form_data, isLoading, exam_timetable, isFetching, marks_columns, marks_dataSource } = useDetailSchedule();
  const navigate = useNavigate();

  return (
    <div>
      <div className="dajc">
        <div className="f1">
          <Breadcrumb className="ms-3 mb-2" items={[{ title: "Exam timetable", path: "/divider/exam/student/schedules" }, { title: "View" }]} />
        </div>
        <RecordPagination handleChangePage={(id) => navigate(`/divider/exam/student/schedules/detail/${id}`)} id={id} api_name="api/exam/student-schedules/ids" />
      </div>
      <Ribbon
        color={exam_timetable?.exam_timetable?.is_attendance_marked ? (exam_timetable?.exam_timetable?.is_present ? "green" : "red") : "gold"}
        text={exam_timetable?.exam_timetable?.is_attendance_marked ? (exam_timetable?.exam_timetable?.is_present ? "Present" : "Absent") : "Not marked"}
      >
        <CardCmp
          title={
            <div>
              Exam Schedule &nbsp;&nbsp;
              <LoaderCmp style={{ visibility: isFetching ? "visible" : "hidden" }} />
            </div>
          }
          className="mt-2"
        >
          <LoaderWithChildren isLoading={isLoading}>
            <div className="row">
              <FormWithHook is_edit={false} className="col-lg-6" control={control} data={form_data} />
              <div className="col-lg-6 daj">
                <div>
                  <Para className="fw-bold text-center">{exam_timetable?.exam_timetable?.exam_room?.name}</Para>
                  <RoomVisual exam_timetable={exam_timetable} />
                </div>
              </div>
            </div>
            <Mark columns={marks_columns} dataSource={marks_dataSource} />
          </LoaderWithChildren>
        </CardCmp>
      </Ribbon>
    </div>
  );
}

const RoomVisual = ({ exam_timetable }) => {
  console.log();
  const { colorBorder, colorPrimary, colorBgContainer } = useColors();
  let selected_place = `${exam_timetable?.row}_${exam_timetable?.column}`;

  return (
    <div>
      {new Array(exam_timetable?.exam_timetable?.exam_room?.column).fill(1)?.map((_, col_index) => {
        return (
          <div className="df" key={col_index}>
            {new Array(exam_timetable?.exam_timetable?.exam_room?.row)?.fill(1)?.map((_, row_index) => {
              let room_key = `${row_index + 1}_${col_index + 1}`;
              let is_placed = room_key == selected_place;
              return (
                <div
                  style={{ border: `1px solid ${colorBorder}`, height: "30px", width: "30px", ...(is_placed && { backgroundColor: colorPrimary }) }}
                  className={"m-1 rounded daj"}
                  key={col_index + row_index}
                >
                  <Icon className="fas fa-user" style={{ color: colorBgContainer }} />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

const Mark = ({ columns, dataSource }) => {
  return (
    <>
      <DividerCmp className="my-2" />
      <Table
        size="small"
        // bordered
        columns={columns}
        dataSource={dataSource}
        pagination={false}
      />
    </>
  );
};
