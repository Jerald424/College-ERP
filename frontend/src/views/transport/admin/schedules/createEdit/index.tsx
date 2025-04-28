import { CloseCircleFilled, SaveFilled } from "@ant-design/icons";
import { Breadcrumb, Tag } from "antd";
import { CardCmp, DividerCmp } from "src/components/layouts/container";
import FormWithHook from "src/components/layouts/form";
import { LoaderWithChildren } from "src/components/styled";
import useCreate from "./hooks/useCreate";
import ScheduleTabs from "./tabs";
import Ribbon from "antd/es/badge/Ribbon";
import BusRouteTracking from "./tracker";
import { useColors } from "src/redux/hooks";

export default function TransportBusScheduleCreateEdit() {
  const { colorBorderSecondary } = useColors();
  const { control, form_data, record_id, Modal, handleSubmit, navigate, isLoading, onSubmit, isEdit, setIsEdit, session_id, data, fetchSchedule } = useCreate();

  let is_edit = isEdit || !record_id;
  return (
    <div>
      <Breadcrumb className="ms-3 mb-2" items={[{ title: "Bus Schedule", path: "/divider/transport/bus/schedules" }, { title: record_id ? "Update" : "Create" }]} />
      <LoaderWithChildren isLoading={isLoading}>
        <form onSubmit={handleSubmit}>
          <Ribbon text={data?.is_entered ? "Marked" : "Not Marked"} color={data?.is_entered ? "green" : "orange"}>
            <CardCmp title={<Header isEdit={isEdit} setIsEdit={setIsEdit} record_id={record_id} />} className="mt-2 z-0">
              <div className="row">
                <div {...(record_id && { className: "col-lg-9", style: { borderRight: `1px solid ${colorBorderSecondary}` } })}>
                  <FormWithHook is_edit={is_edit} className="col-lg-6" control={control} data={form_data} />
                  {record_id && <ScheduleTabs fetchSchedule={fetchSchedule} schedule_id={record_id} session_id={session_id} />}
                </div>
                {record_id && (
                  <div className="col-lg-3 mt-3 mt-lg-0 ">
                    <BusRouteTracking session_id={session_id} />
                  </div>
                )}
              </div>
            </CardCmp>
          </Ribbon>
        </form>
      </LoaderWithChildren>
      <Modal description={record_id ? "Update bus schedule" : "Create bus schedule"} okButtonProps={{ onClick: onSubmit }} />
    </div>
  );
}

const Header = ({ record_id, isEdit, setIsEdit }: { record_id: number; isEdit: boolean; setIsEdit: React.Dispatch<React.SetStateAction<boolean>> }) => {
  return (
    <div className="dajc">
      {record_id ? "Update bus schedule" : "Create bus schedule"}
      {isEdit || !record_id ? (
        <>
          {record_id && (
            <Tag onClick={() => setIsEdit(false)} className="ms-3 cp" color="error" icon={<CloseCircleFilled />}>
              Discard
            </Tag>
          )}
          <>
            <label htmlFor="save">
              <Tag className="ms-3 cp" color="success" icon={<SaveFilled />}>
                Save
              </Tag>
            </label>
            <button className="d-none" id="save" />
          </>
        </>
      ) : (
        <></>
        // <Tag onClick={() => setIsEdit(true)} className="ms-3 cp" color="blue" icon={<EditFilled />}>
        //   Edit
        // </Tag>
      )}
    </div>
  );
};
