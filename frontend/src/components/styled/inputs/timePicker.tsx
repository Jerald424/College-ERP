import { TimePicker, TimePickerProps, TimeRangePickerProps } from "antd";
import dayjs from "dayjs";
import { Controller, ControllerProps } from "react-hook-form";
import { Para } from "../typography";
import { useColors } from "src/redux/hooks";

interface TimePickerCmpProps extends Partial<TimePickerProps> {
  reactRef?: any;
  handleChange?: (val: string | string[]) => void;
  time_picker_type?: "time_picker" | "time_range_picker";
}

const { RangePicker } = TimePicker;

export default function TimePickerCmp({ time_picker_type = "time_picker", ...props }: TimePickerCmpProps) {
  if (time_picker_type === "time_picker")
    return (
      <TimePicker
        ref={props?.reactRef}
        {...props}
        onChange={(val, timeStr) => {
          props?.onChange?.(val, timeStr);
          props?.handleChange?.(timeStr);
        }}
        {...(props?.value && { value: dayjs(props?.value, "HH:mm") })}
      />
    );
  else
    return (
      <RangePicker
        ref={props?.reactRef}
        {...props}
        onChange={(valArr, timeArrStr) => {
          props?.onChange?.(valArr, timeArrStr);
          props?.handleChange?.(timeArrStr);
        }}
        // value={[dayjs(props?.value?.[0], "HH:mm"), dayjs(props?.value?.[1], "HH:mm")]}
        {...(props?.value && { value: [dayjs(props?.value?.[0], "HH:mm"), dayjs(props?.value?.[1], "HH:mm")] })}
      />
    );
}

export interface TimePickerWithHKProps extends Omit<ControllerProps, "render"> {
  timePickerProps?: TimePickerCmpProps;
  id?: string;
}

export const TimePickerWithHK = ({ timePickerProps, ...props }: TimePickerWithHKProps) => {
  const { colorError } = useColors();

  if (props?.control && props?.name)
    return (
      <Controller
        {...props}
        render={({ field: { ref, onChange, ...restField }, fieldState: { error } }) => {
          let err_msg = error?.message;

          return (
            <>
              <TimePickerCmp allowClear={false} {...timePickerProps} className={`w-100 ${timePickerProps?.className}`} reactRef={ref} {...restField} handleChange={onChange} />
              {err_msg && <Para style={{ color: colorError }}>{err_msg}</Para>}
            </>
          );
        }}
      />
    );
  else return <TimePickerCmp {...timePickerProps} />;
};
