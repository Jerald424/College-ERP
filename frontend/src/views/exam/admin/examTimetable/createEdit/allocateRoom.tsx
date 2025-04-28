import { Icon, ModalCmp, Para } from "src/components/styled";
import useAllocateRoom from "./useAllocateRoom";
import { Table, Tooltip } from "antd";
import { useColors } from "src/redux/hooks";
import { DividerCmp } from "src/components/layouts/container";

export default function AllocateRoomModal({ isOpenAllocateRoom, setIsOpenAllocateRoom, class_id, exam_room_id, exam_timetable_id, date, exam_time_id, selected_room }) {
  const { columns, dataSource, studentRooms, handleAllocate, prev_allocated, isLoadingAllocate } = useAllocateRoom({
    class_id,
    exam_room_id,
    exam_timetable_id,
    date,
    exam_time_id,
    selected_room,
    setIsOpenAllocateRoom,
  });
  const { colorSuccess, colorBorder, colorWarning, colorError } = useColors();

  return (
    <ModalCmp confirmLoading={isLoadingAllocate} onOk={handleAllocate} width={1000} title="Allocate Exam Room" onCancel={() => setIsOpenAllocateRoom(false)} open={!!isOpenAllocateRoom}>
      <div className="row">
        <div className="col-lg-7">
          <Table
            size="small"
            loading={false}
            // bordered
            columns={columns}
            dataSource={dataSource}
            scroll={{ y: 250 }}
          />
        </div>
        <div className="col-lg-5">
          <div className=" daj">
            <div>
              <Para className="fw-bold text-center">{selected_room?.name}</Para>
              {new Array(selected_room?.column).fill(1)?.map((_, col_index) => {
                return (
                  <div className="df" key={col_index}>
                    {new Array(selected_room?.row)?.fill(1)?.map((_, row_index) => {
                      let room_key = `${row_index + 1}_${col_index + 1}`;
                      let new_student = studentRooms?.room_by_student?.[room_key];
                      let prev_al = prev_allocated?.room_by_student?.[room_key];
                      return (
                        <Tooltip showArrow title={prev_al ? `${prev_al?.applicant?.name} (${prev_al?.roll_no})` : new_student ? `${new_student?.applicant?.name} (${new_student?.roll_no})` : ""}>
                          <div style={{ borderColor: colorBorder }} className={"btn m-1  btn-sm"} key={col_index + row_index}>
                            {prev_al ? (
                              <Icon className="fa-solid fa-ban" style={{ color: colorError }}></Icon>
                            ) : new_student ? (
                              <Icon className="fa-solid fa-check" style={{ color: colorSuccess }} />
                            ) : (
                              <Icon className="fa-solid fa-hourglass-start" style={{ color: colorWarning }}>
                                {" "}
                              </Icon>
                            )}
                          </div>
                        </Tooltip>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
          <DividerCmp className="mt-1 mb-0" />
          <div className="text-center ">
            <Icon className="fa-solid fa-hourglass-start" style={{ color: colorWarning }} /> Free &nbsp;&nbsp;
            <Icon className="fa-solid fa-check" style={{ color: colorSuccess }} /> Occupied Now &nbsp;&nbsp;
            <Icon className="fa-solid fa-ban" style={{ color: colorError }}></Icon> Already Booked &nbsp;&nbsp;
          </div>
        </div>
      </div>
    </ModalCmp>
  );
}
