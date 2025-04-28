import { ArrowRightOutlined, FileExcelFilled } from "@ant-design/icons";
import { Tag } from "antd";
import { isEmpty } from "lodash";
import { HTMLProps, useState } from "react";
import { Control, FieldValues, RegisterOptions, UseFormReset, UseFormSetValue, UseFormWatch, useWatch } from "react-hook-form";
import { FlatList, InputBoxWithHK, ModalCmp } from "src/components/styled";
import { CheckBoxWithHook, CheckBoxWithHookProps } from "src/components/styled/inputs/checkbox";
import { CKEEditorWithHK, CKEEditorWithHKProps } from "src/components/styled/inputs/ckeEditor";
import { DatePickerWithHK, DatePickerWithHKProps } from "src/components/styled/inputs/datepicker";
import { DropdownWithHK, DropdownWithHKProps } from "src/components/styled/inputs/dropdown";
import { InputBoxWithHKProps } from "src/components/styled/inputs/inputBox";
import SwitchCmp, { SwitchWithHK } from "src/components/styled/inputs/switch";
import { TimePickerWithHK, TimePickerWithHKProps } from "src/components/styled/inputs/timePicker";
import { Para, ParagraphProps } from "src/components/styled/typography";
import { getHHMMFromJsDate, makeJsDateToDDMMYYYY } from "src/functions/handleDate";
import { useColors } from "src/redux/hooks";

export type rulesInter = Omit<RegisterOptions<any, string>, "disabled" | "valueAsNumber" | "valueAsDate" | "setValueAs"> | undefined;
export type controlInter = Control<FieldValues, any>;
export type resetInter = UseFormReset<FieldValues>;
export type watchInter = UseFormWatch<FieldValues>;
export type setValueInter = UseFormSetValue<FieldValues>;

interface data
  extends Partial<InputBoxWithHKProps>,
    Partial<DropdownWithHKProps>,
    Partial<CheckBoxWithHookProps>,
    Partial<DatePickerWithHKProps>,
    Partial<CKEEditorWithHKProps>,
    Partial<TimePickerWithHKProps> {
  name: string;
  label: string | React.ReactNode;
  note?: string;
  type: "input_box" | "drop_down" | "date_picker" | "check_box" | "boolean" | "ckeEditor" | "time_picker";
  place_holder?: string;
  conProps?: HTMLProps<HTMLDivElement>;
  labelProps?: ParagraphProps;
  inputsContainerProps?: HTMLProps<HTMLDivElement>;
  viewOnly?: boolean;
  is_tag?: boolean;
}

export type formData = data[];

interface formWithHKInter extends Omit<HTMLProps<HTMLDivElement>, "data"> {
  data: formData;
  control: controlInter;
  is_edit?: boolean;
}

const cmp = {
  input_box: InputBoxWithHK,
  drop_down: DropdownWithHK,
  date_picker: DatePickerWithHK,
  check_box: CheckBoxWithHook,
  boolean: SwitchWithHK,
  ckeEditor: CKEEditorWithHK,
  time_picker: TimePickerWithHK,
};

export default function FormWithHook(props: formWithHKInter) {
  const { colorError } = useColors();
  return (
    <FlatList
      {...props}
      renderItem={(item: data) => {
        let Cmp = cmp?.[item?.type];
        if (!Cmp) return;
        return (
          <div key={item?.name} {...item?.conProps} className={`${item?.type === "check_box" && "df"} ${item?.conProps?.className}`}>
            <Para {...item?.labelProps} className={`mb-0  ${item?.labelProps?.className}`}>
              <label htmlFor={item?.name}>
                {item?.label} {item?.rules?.required && props?.is_edit && <span style={{ color: colorError }}>*</span>}
              </label>
            </Para>
            <div {...item?.inputsContainerProps}>
              {props?.is_edit && !item?.viewOnly ? <Cmp {...item} control={props?.control} id={item?.name} /> : <ViewValue control={props?.control} {...item} />}
            </div>
          </div>
        );
      }}
    />
  );
}

FormWithHook.defaultProps = {
  is_edit: true,
};

const ViewValue = (item: data) => {
  const { colorPrimary } = useColors();
  const [isOpen, setIsOpen] = useState();

  let value = useWatch({ control: item?.control, name: item?.name });
  if (item?.type === "drop_down") {
    if (item?.dropdownProps?.mode == "multiple") {
      if (!isEmpty(value))
        value = value
          ?.map((res) => {
            return item?.dropdownProps?.options?.find((op) => op?.[item?.dropdownProps?.optional_value] == res)?.[item?.dropdownProps?.optional_label];
          })
          ?.flat();
      // ?.join(", ");
      if (item?.is_tag)
        value = value?.map((res) => (
          <Tag className="mb-1" key={res}>
            {res}
          </Tag>
        ));
      else value = value?.join(", ");
    } else value = item?.dropdownProps?.options?.find((res) => res?.[item?.dropdownProps?.optional_value] === value)?.[item?.dropdownProps?.optional_label];
  }

  if (item?.inputProps?.type === "file")
    return (
      <>
        {value ? <FileExcelFilled onClick={() => setIsOpen(true)} style={{ color: colorPrimary, fontSize: 20 }} className="cp" /> : "-"}
        <ModalCmp centered onCancel={() => setIsOpen(false)} open={isOpen} footer={null} closeIcon={null} width={1000}>
          <iframe src={value} width={"100%"} height={500} />
        </ModalCmp>
      </>
    );
  else if (item?.datePickerProps?.date_picker_type === "date_range") {
    return (
      <Para className={`fw-medium`}>
        {value ? (
          <div>
            {makeJsDateToDDMMYYYY(value?.[0])} {item?.datePickerProps?.showTime && getHHMMFromJsDate(value?.[0])}
            <ArrowRightOutlined className="mx-3" />
            {makeJsDateToDDMMYYYY(value?.[1])} {item?.datePickerProps?.showTime && getHHMMFromJsDate(value?.[1])}
          </div>
        ) : (
          "-"
        )}
      </Para>
    );
  } else if (item?.type == "date_picker") return <Para className="fw-medium">{makeJsDateToDDMMYYYY(value)}</Para>;
  else if (item?.type === "boolean") return <SwitchCmp value={value} />;
  else if (item?.type === "ckeEditor") return <div className="table-responsive" dangerouslySetInnerHTML={{ __html: value }} />;
  else if (item?.timePickerProps?.time_picker_type == "time_range_picker")
    return (
      <Para className={`fw-medium`}>
        {value ? (
          <div>
            {value?.[0]}
            <ArrowRightOutlined className="mx-3" />
            {value?.[1]}
          </div>
        ) : (
          "-"
        )}
      </Para>
    );
  return <Para className={`fw-medium`}>{!isEmpty(value) ? value : "-"}</Para>;
};
