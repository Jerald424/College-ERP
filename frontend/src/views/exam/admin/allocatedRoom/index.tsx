import { Collapse, Table } from "antd";
import { CardCmp, DividerCmp } from "src/components/layouts/container";
import FormWithHook from "src/components/layouts/form";
import { useColors } from "src/redux/hooks";
import useAllocatedExamRoom from "./useAllocatedRoom";
import { Icon, LoaderWithChildren, Para, SubHeading } from "src/components/styled";

export default function AllocateExamRoom() {
  const { form_data, control, selected_room, columns, dataSource, isLoadingTimetable, setExam_timetable_id, isFetching, room_data } = useAllocatedExamRoom();

  let items = [
    {
      key: "timetables",
      label: "Timetables",
      children: (
        <Table
          onRow={(item) => {
            return {
              onClick: () => setExam_timetable_id(item?.id),
              className: "cp",
            };
          }}
          size="small"
          loading={isLoadingTimetable}
          // bordered
          columns={columns}
          dataSource={dataSource}
        />
      ),
    },
    {
      key: "room",
      label: "Room",
      children: <RoomVisual room_data={room_data} isFetching={isFetching} selected_room={selected_room} />,
    },
  ];

  return (
    <CardCmp title="Allocated exam room">
      <div className="row p-0 m-0">
        <FormWithHook is_edit className="col-lg-6" control={control} data={form_data} />
      </div>
      <Collapse size="small" bordered={false} items={items} defaultActiveKey={["timetables", "room"]} />
    </CardCmp>
  );
}

const RoomVisual = ({ selected_room, isFetching, room_data }) => {
  const { colorBorder, colorWarning, colorSuccess } = useColors();
  return (
    <LoaderWithChildren isLoading={isFetching}>
      <div className="dajc">
        <div className="border f1 p-0 ms-3" />
        <SubHeading className="mx-3">Row</SubHeading>
        <div className="border f1 p-0" />
      </div>
      <div className="df">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div className="border f1 p-0" />
          <SubHeading style={{ writingMode: "vertical-rl" }} className="my-2">
            Column
          </SubHeading>
          <div className="border f1 p-0" />
        </div>
        <div className="f1 p-3">
          {new Array(selected_room?.column).fill(1)?.map((_, col_index) => {
            return (
              <div className="df" key={col_index}>
                {new Array(selected_room?.row)?.fill(1)?.map((_, row_index) => {
                  let room_key = `${row_index + 1}_${col_index + 1}`;
                  let student = room_data?.[room_key];
                  return (
                    <div style={{ borderColor: colorBorder }} className={"f1 btn  m-2 rounded daj"} key={col_index + row_index}>
                      {student ? (
                        <Para>
                          {student?.applicant?.name} ({student?.roll_no})
                        </Para>
                      ) : (
                        <>
                          <Icon className="fa-solid fa-hourglass-start" style={{ color: colorWarning }} />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </LoaderWithChildren>
  );
};
