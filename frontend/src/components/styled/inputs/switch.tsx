import { Switch, SwitchProps } from "antd";
import { Controller, ControllerProps } from "react-hook-form";
import { useColors } from "src/redux/hooks";
import { Para } from "../typography";

interface SwitchCmpProps extends SwitchProps {
  reactRef?: any;
}

export default function SwitchCmp(props: SwitchCmpProps) {
  return <Switch {...props} ref={props?.reactRef} />;
}

export interface DatePickerWithHKProps extends Omit<ControllerProps, "render"> {
  switchProps?: SwitchCmpProps;
  id?: string;
}

export const SwitchWithHK = ({ switchProps, ...props }: DatePickerWithHKProps) => {
  const { colorError } = useColors();

  if (props?.control && props?.name)
    return (
      <Controller
        {...props}
        render={({ field: { onChange, value, ref, ...restField }, fieldState: { error } }) => {
          let err_msg = error?.message;
          return (
            <>
              <SwitchCmp
                {...restField}
                {...switchProps}
                id={props.id}
                reactRef={ref}
                checked={value}
                onChange={(checked, event) => {
                  onChange?.(checked);
                  switchProps?.onChange?.(checked, event);
                }}
              />
              {err_msg && <Para style={{ color: colorError }}>{err_msg}</Para>}
            </>
          );
        }}
      />
    );
  else return <SwitchCmp {...switchProps} />;
};
