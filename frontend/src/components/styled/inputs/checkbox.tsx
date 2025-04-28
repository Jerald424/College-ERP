import { Checkbox, CheckboxProps } from "antd";
import { Controller, ControllerProps } from "react-hook-form";
import { Para } from "../typography";
import { useColors } from "src/redux/hooks";

interface CheckBoxCmpProps extends CheckboxProps {
  reactRef?: any;
}
export default function CheckBoxCmp({ ...props }: CheckBoxCmpProps) {
  return <Checkbox {...props} ref={props?.reactRef} />;
}

export interface CheckBoxWithHookProps extends Omit<ControllerProps, "render"> {
  checkBoxProps?: CheckBoxCmpProps;
  id?: string;
}
export const CheckBoxWithHook = ({ checkBoxProps, ...props }: CheckBoxWithHookProps) => {
  const { colorError } = useColors();
  if (props?.control && props?.name)
    return (
      <Controller
        {...props}
        render={({ field: { onChange, ref, ...restField }, fieldState: { error } }) => {
          let err_msg = error?.message;

          return (
            <>
              <CheckBoxCmp
                {...checkBoxProps}
                checked={restField?.value}
                id={props?.id}
                {...restField}
                reactRef={ref}
                onChange={(e) => {
                  onChange?.(e?.target?.checked);
                  checkBoxProps?.onChange?.(e);
                }}
              />
              {err_msg && <Para style={{ color: colorError }}>{err_msg}</Para>}
            </>
          );
        }}
      />
    );
};
