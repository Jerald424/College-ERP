import { Input, InputProps } from "antd";
import { Controller, ControllerProps } from "react-hook-form";
import { Para } from "../typography";
import { useColors } from "src/redux/hooks";
import { ButtonCmp } from "../button";
import { EyeOutlined } from "@ant-design/icons";
import { handlePreviewBase64 } from "./functions";
import { makeBase64 } from "src/functions/handleData";
import TextArea from "antd/es/input/TextArea";

export interface InputBoxProps extends InputProps {
  reactRef?: any;
}
export default function InputBox(props: InputBoxProps) {
  if (props?.type == "file") {
    const handleChange = (e) => {
      makeBase64(e?.target?.files?.[0]).then((res) => {
        props?.onChange?.({ target: { value: res } });
      });
    };
    return (
      <div className="dajc">
        <Input {...props} ref={props?.reactRef} value={undefined} onChange={handleChange} />
        {props?.value && <ButtonCmp onClick={() => handlePreviewBase64({ value: props?.value })} icon={<EyeOutlined />} />}
      </div>
    );
  } else if (props?.type === "textarea") return <TextArea ref={props?.reactRef} {...props} />;

  return <Input {...props} ref={props?.reactRef} />;
}

export interface InputBoxWithHKProps extends Omit<ControllerProps, "render"> {
  inputProps?: InputBoxProps;
  id?: string;
}
export const InputBoxWithHK = ({ inputProps, ...props }: InputBoxWithHKProps) => {
  const { colorError } = useColors();
  if (props?.name && props?.control)
    return (
      <Controller
        {...props}
        render={({ field: { onChange, ref, ...restField }, fieldState: { error } }) => {
          let err_msg = error?.message;
          return (
            <>
              <InputBox reactRef={ref} {...restField} id={props?.id} onChange={(e) => onChange(e?.target?.value)} {...inputProps} />
              {err_msg && <Para style={{ color: colorError }}>{err_msg}</Para>}
            </>
          );
        }}
      />
    );
  else return <InputBox {...inputProps} />;
};
