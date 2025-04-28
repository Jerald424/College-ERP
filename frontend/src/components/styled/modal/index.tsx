import { Modal, ModalProps } from "antd";

export interface ModalCmpProps extends ModalProps {}

export default function ModalCmp(props: ModalCmpProps) {
  return <Modal {...props} />;
}
