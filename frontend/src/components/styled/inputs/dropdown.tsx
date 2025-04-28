import { Select, SelectProps } from "antd";
import isArray from "lodash/isArray";
import { useMemo, useTransition } from "react";
import { Controller, ControllerProps, useWatch } from "react-hook-form";
import { checkValueAreIncludes } from "src/functions/handleData";
import { Para } from "../typography";
import { useColors } from "src/redux/hooks";

export interface DropdownProps extends SelectProps {
  /**
   * @default label
   */
  optional_label?: string;
  /**
   * @default value
   */
  optional_value?: string;
  handleChange?: (val: any) => void;
  reactRef?: any;
}

export default function Dropdown({ optional_label = "label", optional_value = "value", ...props }: DropdownProps) {
  const [isPending, setTransition] = useTransition();

  return (
    <Select
      ref={props?.reactRef}
      showSearch
      {...props}
      loading={isPending || props?.loading}
      onChange={(value) => {
        setTransition(() => {
          props?.handleChange?.(value);
        });
      }}
      options={
        isArray(props?.options)
          ? props?.options?.map((option) => ({
              value: option?.[optional_value],
              label: option?.[optional_label],
            }))
          : []
      }
      optionFilterProp="children"
      filterOption={(input, option: any) => checkValueAreIncludes({ searched: input, text: option?.label })}
    />
  );
}

export interface DropdownWithHKProps extends Omit<ControllerProps, "render"> {
  dropdownProps?: DropdownProps;
  id?: string;
  isView?: boolean;
}
export const DropdownWithHK = ({ dropdownProps, ...props }: DropdownWithHKProps) => {
  const colors = useColors();
  if (props?.control && props?.name)
    return (
      <Controller
        {...props}
        render={({ field: { onChange, ref, ...restField }, fieldState: { error } }) => {
          let err_msg = error?.message;
          if (props?.isView) return <View dropdownProps={dropdownProps} value={restField?.value} />;
          return (
            <>
              <Dropdown
                {...dropdownProps}
                className={`w-100 ${dropdownProps?.className}`}
                {...restField}
                reactRef={ref}
                id={props?.id}
                handleChange={(val) => {
                  onChange(val);
                  dropdownProps?.onChange?.(val);
                }}
              />
              {err_msg && <Para style={{ color: colors?.colorError }}>{err_msg}</Para>}
            </>
          );
        }}
      />
    );
  else return <Dropdown {...dropdownProps} />;
};

const View = ({ dropdownProps, value }: { dropdownProps: DropdownProps; value: any }) => {
  let label = useMemo(() => {
    try {
      return dropdownProps?.options?.find((res) => res?.[dropdownProps?.optional_value] == value)?.[dropdownProps?.optional_label];
    } catch (error) {
      console.error(error);
    }
  }, [value, dropdownProps?.options]);
  return <Para>{label || "-"}</Para>;
};
