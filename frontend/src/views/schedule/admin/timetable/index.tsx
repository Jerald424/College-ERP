import { DeleteOutlined, EditOutlined, PlusOutlined, CalendarOutlined } from "@ant-design/icons";
import { Alert, Tag } from "antd";
import { isEmpty } from "lodash";
import { useMemo } from "react";
import { CardCmp, DividerCmp } from "src/components/layouts/container";
import FormWithHook, { formData } from "src/components/layouts/form";
import { ButtonCmp, CheckBoxCmp, LoaderWithChildren, ModalCmp, Para } from "src/components/styled";
import { useColors } from "src/redux/hooks";
import { week_days_selection } from "../calender/eventCreate/useEventCreate";
import useTimetableView from "./useTimetableView";
import AuditLog from "src/components/layouts/audit";
import GenerateSchedule from "./generateSchedule";

export default function TimetableView() {
  const { colorError, colorInfo, colorWarning, colorBorder } = useColors();
  const {
    control,
    form_data,
    hour,
    tt_object,
    classes,
    staff,
    course,
    modalOpen,
    setModelOpen,
    handleSelectHour,
    selectedHrDay,
    terms,
    handleSubmit,
    reset,
    isLoadingTimetable,
    onEditTimetable,
    isLoadingSepTimetable,
    Modal,
    setIsOpen,
    setSelectedHrDay,
    handleDelete,
    is_generate_schedule_enabled,
    term_id,
    class_id,
  } = useTimetableView();
  return (
    <>
      <CardCmp
        title={
          <Header
            class_id={class_id}
            terms={terms?.rows}
            hour_by_day={tt_object}
            term_id={term_id}
            is_generate_schedule_enabled={is_generate_schedule_enabled}
            reset={reset}
            setModelOpen={setModelOpen}
            selectedHrDay={selectedHrDay}
          />
        }
      >
        <FormWithHook className="col-lg-6" control={control} data={form_data} />
        <LoaderWithChildren isLoading={isLoadingTimetable}>
          {isEmpty(hour) ? (
            <Alert banner message="Select Term & Class" type="info" className="mt-3" />
          ) : (
            <div style={{ border: `0.25px solid ${colorBorder}` }} className=" mt-3 table-responsive">
              <div className="grid-8 fw-bold">
                <div className="daj p-2" style={{ border: `0.25px solid ${colorBorder}` }}>
                  Hour/Days
                </div>
                {week_days_selection?.map((res) => {
                  return (
                    <div key={res?.id} className="daj p-2 " style={{ border: `0.25px solid ${colorBorder}` }}>
                      {res?.name}
                    </div>
                  );
                })}
              </div>
              {hour?.map((hr) => {
                let [shr, smin] = hr?.time_from?.split(":");
                let [ehr, emin] = hr?.time_to?.split(":");
                let hr_obj = tt_object?.[hr?.id];
                let HHMM = `(${[shr, smin]?.join(":")} - ${[ehr, emin]?.join(":")})`;
                if (hr?.type?.id == "break")
                  return (
                    <div className="text-center  p-2 fw-bold bg-secondary-subtle" style={{ color: colorWarning, border: `0.25px solid ${colorBorder}` }}>
                      {hr?.name} {HHMM}
                    </div>
                  );
                return (
                  <div key={hr?.id} className="grid-8  ">
                    <div className="daj p-2 fw-bold" style={{ border: `0.25px solid ${colorBorder}` }}>
                      {hr?.name} {HHMM}
                    </div>
                    {week_days_selection?.map((days) => {
                      let day = hr_obj?.[days?.id];
                      let name = `${hr?.id}_${days?.id}`;
                      return (
                        <div key={hr?.id + days?.id} className="p-2  cp" style={{ minHeight: "70px", border: `0.25px solid ${colorBorder}` }}>
                          <div className="daj">
                            {day ? (
                              <>
                                <EditOutlined onClick={() => onEditTimetable({ timetable: day })} style={{ color: colorInfo, fontSize: 20 }} className="me-2 " />
                                <DeleteOutlined onClick={() => setIsOpen(day)} style={{ color: colorError, fontSize: 20 }} />
                              </>
                            ) : (
                              <CheckBoxCmp onChange={() => handleSelectHour({ name })} checked={selectedHrDay?.includes(name)} />
                            )}
                          </div>
                          <div className="text-center mt-1">{day?.course?.name}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </LoaderWithChildren>
        <TimetableAllocateModal
          setSelectedHrDay={setSelectedHrDay}
          isLoading={isLoadingSepTimetable}
          selectedHrDay={selectedHrDay}
          hour={hour}
          terms={terms?.rows}
          modalOpen={modalOpen}
          setModelOpen={setModelOpen}
          course={course}
          staff={staff}
          classes={classes?.rows}
          control={control}
          handleSubmit={handleSubmit}
          reset={reset}
        />

        <Modal okButtonProps={{ onClick: handleDelete }} description="Delete timetable" />
      </CardCmp>
      <AuditLog record_id={0} table_names={["timetable", "timetable_staff", "timetable_class"]} />
    </>
  );
}

const Header = ({ selectedHrDay, setModelOpen, reset, is_generate_schedule_enabled, term_id, hour_by_day, terms, class_id }) => {
  return (
    <div>
      Timetable &nbsp;&nbsp;&nbsp;
      {!isEmpty(selectedHrDay) && (
        <>
          <Tag
            onClick={() => {
              setModelOpen(true);
              reset((prev) => ({ ...prev, class_ids_tt: prev?.class_id ? [prev?.class_id] : [] }));
            }}
            className="cp"
            color="blue"
            icon={<PlusOutlined />}
          >
            Create
          </Tag>
        </>
      )}
      {is_generate_schedule_enabled && <GenerateSchedule class_id={class_id} terms={terms} term_id={term_id} hour_by_day={hour_by_day} />}
    </div>
  );
};

const TimetableAllocateModal = ({ control, classes, staff, course, modalOpen, setModelOpen, terms, hour, selectedHrDay, handleSubmit, isLoading, reset, setSelectedHrDay }) => {
  let form_data: formData = [
    {
      label: "Course",
      name: "course_id_tt",
      type: "drop_down",
      rules: { required: "Course is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df" },
      labelProps: { className: "f1" },
      dropdownProps: {
        options: course?.rows,
        optional_label: "name",
        optional_value: "id",
      },
    },
    {
      label: "Class",
      name: "class_ids_tt",
      type: "drop_down",
      rules: { required: "Class is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df" },
      labelProps: { className: "f1" },
      dropdownProps: {
        autoFocus: true,
        options: classes,
        optional_label: "name",
        optional_value: "id",
        mode: "multiple",
      },
    },
    {
      label: "Staff",
      name: "staff_ids_tt",
      type: "drop_down",
      rules: { required: "Staff is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df" },
      labelProps: { className: "f1" },
      dropdownProps: {
        options: staff?.rows,
        optional_label: "name",
        optional_value: "id",
        mode: "multiple",
      },
    },
    {
      label: "Term",
      name: "term_id",
      type: "drop_down",
      rules: { required: "Term is required" },
      inputsContainerProps: { className: "f2" },
      conProps: { className: "df" },
      labelProps: { className: "f1" },
      viewOnly: true,
      dropdownProps: {
        options: terms,
        optional_label: "name",
        optional_value: "id",
      },
    },
  ];

  let hr_data = useMemo(() => {
    try {
      return selectedHrDay?.map((res) => {
        let [hr_id, day] = res?.split("_");
        let hr = hour?.find((hr) => hr?.id == hr_id);
        let day_order = week_days_selection?.find((wd) => wd?.id == day);
        return `${day_order?.name} - ${hr?.name}`;
      });
    } catch (error) {
      console.error(error);
    }
  }, [selectedHrDay]);

  const onClose = () => {
    setSelectedHrDay([]);
    setModelOpen(false);
    reset((prev) => ({
      ...prev,
      id: null,
      class_ids_tt: [],
      course_id_tt: null,
      staff_ids_tt: null,
    }));
  };

  return (
    <ModalCmp
      footer={
        <div>
          <ButtonCmp onClick={onClose} type="default" className="me-3">
            Discard
          </ButtonCmp>
          <ButtonCmp onClick={handleSubmit}>Save</ButtonCmp>
        </div>
      }
      open={!!modalOpen}
      onCancel={onClose}
      title="Allocate Timetable"
      width={1000}
    >
      <LoaderWithChildren isLoading={isLoading}>
        <FormWithHook className="grid-2" control={control} data={form_data} />
        <DividerCmp />
        <Para>Hours</Para>
        {hr_data?.map((res) => (
          <Tag color="gold" key={res}>
            {res}
          </Tag>
        ))}
      </LoaderWithChildren>
    </ModalCmp>
  );
};
