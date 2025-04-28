import { Alert, Breadcrumb, Collapse, Radio } from "antd";
import { memo, useMemo, useTransition } from "react";
import { CardCmp } from "src/components/layouts/container";
import FormWithHook, { formData } from "src/components/layouts/form";
import { ButtonCmp, LoaderCmp, LoaderWithChildren } from "src/components/styled";
import { useBase } from "src/redux/hooks";
import { AdminCalenderPart } from "..";
import useEventCreate, { week_days_selection } from "./useEventCreate";
import { useNavigate } from "react-router-dom";
import { isEmpty } from "lodash";

export default function EventCreate() {
  const navigate = useNavigate();

  const {
    control,
    form_data,
    handleSelectDate,
    selectedDate,
    description_form_data,
    reset,
    isLoadingTerms,
    termsData,
    selectedFilterMode,
    setSelectedFilterMode,
    handleSubmit,
    isLoadingCreateMutate,
  } = useEventCreate();
  return (
    <div>
      <Breadcrumb className="ms-3 mb-2" items={[{ title: "Calender", path: "/divider/schedule/calender" }, { title: "Events" }]} />
      <form onSubmit={handleSubmit}>
        <LoaderWithChildren isLoading={isLoadingCreateMutate}>
          <CardCmp
            actions={[
              <div className="ae me-3">
                <ButtonCmp type="link" className="me-3" onClick={() => navigate(-1)}>
                  Discard
                </ButtonCmp>
                <ButtonCmp disabled={isEmpty(selectedDate)} htmlType="submit">
                  Save
                </ButtonCmp>
              </div>,
            ]}
            style={{ zIndex: 0 }}
            title="Events"
          >
            <FormWithHook className="col-lg-6" control={control} data={form_data} />
            <MoreFilter selectedMode={selectedFilterMode} setSelectedMode={setSelectedFilterMode} isLoadingTerms={isLoadingTerms} terms={termsData} reset={reset} control={control} />
            <AdminCalenderPart is_create handleSelectDate={handleSelectDate} selectedDate={selectedDate} />
            <Alert closable message="If you check this 'Is Holiday' option, the selected days will be considered as holidays" banner type="info" />
            <FormWithHook className="mt-2" control={control} data={description_form_data} />
          </CardCmp>
        </LoaderWithChildren>
      </form>
    </div>
  );
}

const MoreFilter = memo(({ control, reset, terms, isLoadingTerms, selectedMode, setSelectedMode }) => {
  const [transition, setTransition] = useTransition();
  const { academic_year } = useBase();

  const filter_options = [
    { label: "Term", value: "term" },
    { label: "Academic Year", value: "ac.year" },
  ];

  let form_data: formData = useMemo(() => {
    return [
      selectedMode == "term"
        ? {
            label: "Terms",
            name: "terms",
            type: "drop_down",
            // rules: { required: "Terms is required" },
            inputsContainerProps: { className: "f2" },
            conProps: { className: "df" },
            labelProps: { className: "f1" },
            dropdownProps: {
              options: terms?.rows?.map((res) => ({ ...res, name: `${res?.name} (${res?.start_date} to ${res?.end_date})` })),
              loading: isLoadingTerms,
              optional_label: "name",
              optional_value: "id",
              mode: "multiple",
            },
          }
        : {
            label: "Ac.Year",
            name: "ac_year",
            type: "drop_down",
            // rules: { required: "Ac.Year is required" },
            inputsContainerProps: { className: "f2" },
            conProps: { className: "df" },
            labelProps: { className: "f1" },
            dropdownProps: {
              options: academic_year?.rows?.map((res) => ({ ...res, name: `${res?.name} (${res?.start_date} to ${res?.end_date})` })),
              optional_label: "name",
              optional_value: "id",
              mode: "multiple",
            },
          },
      {
        label: "Days",
        name: "days",
        type: "drop_down",
        // rules: { required: "Days is required" },
        inputsContainerProps: { className: "f2 mt-1" },
        conProps: { className: "df" },
        labelProps: { className: "f1" },
        dropdownProps: {
          options: week_days_selection,
          optional_label: "name",
          optional_value: "id",
          mode: "multiple",
        },
      },
    ];
  }, [selectedMode, terms, academic_year]);

  const Filter = () => {
    return (
      <>
        <Radio.Group
          value={selectedMode}
          options={filter_options}
          onChange={(val) =>
            setTransition(() => {
              setSelectedMode(val?.target?.value);
              reset((prev) => ({ ...prev, ac_year: null, terms: null }));
            })
          }
          optionType="button"
          buttonStyle="solid"
        />{" "}
        &nbsp;&nbsp; {transition && <LoaderCmp />}
        <Alert closable banner type="info" className="mt-2" message={`Selected days will be affected across all dates in the selected ${selectedMode == "term" ? "term" : "academic year"} `} />
        <Alert closable banner type="warning" className="mt-2" message={`If you change this, all selected dates will be cleared`} />
        <FormWithHook className="col-lg-6 mt-3" control={control} data={form_data} />
      </>
    );
  };
  let items = [
    {
      key: "more_filter",
      label: "More Options",
      children: <Filter />,
    },
  ];

  return (
    <>
      <Collapse size="small" bordered={false} items={items} defaultActiveKey={["more_filter"]} />
    </>
  );
});
