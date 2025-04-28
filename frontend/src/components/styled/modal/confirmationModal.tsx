import { useEffect, useRef, useState } from "react";
import ModalCmp, { ModalCmpProps } from ".";
import warning_img from "src/assets/color_icon/warning.png";
import delete_img from "src/assets/color_icon/trash.png";
import success_img from "src/assets/color_icon/check-mark.png";
import { Para } from "../typography";
import { ButtonCmp, ButtonCmpProps } from "../button";

interface ConfirmationModalProps extends ModalCmpProps {
  type?: "warning" | "success" | "delete";
  description?: string;
  cancelProps?: ButtonCmpProps;
  okProps?: ButtonCmpProps;
}

const type_icon = {
  warning: warning_img,
  success: success_img,
  delete: delete_img,
};
export default function ConfirmationModal({ type = "warning", cancelButtonProps, okButtonProps, ...props }: ConfirmationModalProps) {
  let icon = type_icon?.[type] ?? type_icon?.["warning"];
  const okBtnRef = useRef();

  useEffect(() => {
    if (props?.open) okBtnRef?.current?.focus?.();
  }, [props?.open]);

  return (
    <ModalCmp
      closeIcon={null}
      title={
        <div className="dajc">
          <img src={icon} style={{ height: 30, width: 30, objectFit: "contain" }} className="me-2" /> Are you sure?
        </div>
      }
      footer={null}
      width={400}
      {...props}
    >
      <Para className="mt-3">{props?.description}</Para>
      <div className="ae mt-3">
        <ButtonCmp {...cancelButtonProps} children={cancelButtonProps?.children ?? "Cancel"} className={`me-3 ${cancelButtonProps?.className}`} danger />
        <ButtonCmp reactRef={okBtnRef} {...okButtonProps} children={okButtonProps?.children ?? "Ok"} />
      </div>
    </ModalCmp>
  );
}

export const useConfirmationModal = () => {
  const [isOpen, setIsOpen] = useState<boolean | any>(false);

  const Modal = (props: ConfirmationModalProps) => {
    return <ConfirmationModal open={!!isOpen} {...props} cancelButtonProps={{ onClick: () => setIsOpen(false) }}></ConfirmationModal>;
  };

  return { isOpen, Modal, setIsOpen };
};
