import { DatePicker, DatePickerProps } from "antd";
import { Controller, ControllerProps } from "react-hook-form";
import { makeDDMMYYYYToJsDate } from "src/functions/handleDate";
import { Para } from "../typography";
import { useColors } from "src/redux/hooks";
import format from "dayjs";

const { RangePicker } = DatePicker;

export interface DatePickerCmpProps extends DatePickerProps {
  handleChange?: (date: Date | [Date, Date]) => void;
  reactRef?: any;
  date_picker_type?: "datepicker" | "date_range";
}

export default function DatePickerCmp({ handleChange, ...props }: DatePickerCmpProps) {
  if (props?.date_picker_type === "date_range") {
    return (
      <RangePicker
        ref={props?.reactRef}
        format="DD-MM-YYYY"
        {...props}
        allowClear={false}
        value={[format(props?.value?.[0]), format(props?.value?.[1])]}
        onChange={(date) => {
          try {
            let [start_date, end_date] = date;
            // start_date = makeDDMMYYYYToJsDate(start_date?.format?.("DD-MM-YYYY"));
            // end_date = makeDDMMYYYYToJsDate(end_date?.format?.("DD-MM-YYYY"));
            start_date = start_date?.format?.();
            end_date = end_date?.format?.();

            handleChange?.([start_date, end_date]);
          } catch (error) {
            console.error(error);
          }
        }}
      />
    );
  } else
    return (
      <DatePicker
        ref={props?.reactRef}
        allowClear={false}
        format={"DD-MM-YYYY"}
        placeholder="Select Date"
        onChange={(date) => {
          try {
            let val = makeDDMMYYYYToJsDate(date?.format?.("DD-MM-YYYY"));
            if (val) handleChange?.(val);
          } catch (error) {
            console.error(error);
          }
        }}
        {...props}
        {...(props?.value && { value: format(props?.value) })}
      />
    );
}

export interface DatePickerWithHKProps extends Omit<ControllerProps, "render"> {
  datePickerProps?: DatePickerCmpProps;
  id?: string;
}

export const DatePickerWithHK = ({ datePickerProps, ...props }: DatePickerWithHKProps) => {
  const { colorError } = useColors();

  if (props?.control && props?.name)
    return (
      <Controller
        {...props}
        render={({ field: { onChange, ref, ...restField }, fieldState: { error } }) => {
          let err_msg = error?.message;

          return (
            <>
              <DatePickerCmp
                {...restField}
                {...datePickerProps}
                id={props?.id}
                {...props}
                reactRef={ref}
                className={`w-100 ${datePickerProps?.className}`}
                handleChange={(val) => {
                  onChange?.(val);
                  datePickerProps?.onChange?.(val);
                }}
              />
              {err_msg && <Para style={{ color: colorError }}>{err_msg}</Para>}
            </>
          );
        }}
      />
    );
  else return <DatePickerCmp {...datePickerProps} />;
};
