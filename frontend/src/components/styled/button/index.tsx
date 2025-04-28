import { Button, ButtonProps } from "antd";
import { HTMLProps, useTransition } from "react";
import { LoaderCmp } from "../loader";

export interface ButtonCmpProps extends ButtonProps {
  reactRef?: any;
  need_loader?: boolean;
}
const ButtonCmp = ({ children, need_loader = true, ...props }: ButtonCmpProps) => {
  const [isPending, setTransition] = useTransition();

  return (
    <Button ref={props?.reactRef} type="primary" {...props} onClick={(e) => setTransition(() => props?.onClick?.(e))} className={` ${props?.className}`}>
      {isPending && need_loader && <LoaderCmp style={{ fontSize: 17 }} className="text-light me-2" />}
      {children}
    </Button>
  );
};

export { ButtonCmp };

export interface iconInter extends HTMLProps<HTMLDivElement> {}

export default function Icon({ className = "fa fa-eye", ...props }: iconInter) {
  return <i className={className} style={{ fontSize: "16px", ...props?.["style"] }} {...props}></i>;
}
