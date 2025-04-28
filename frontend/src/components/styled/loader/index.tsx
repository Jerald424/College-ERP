import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import { SpinProps } from "antd/es/spin";

interface LoaderWithChildrenProps extends SpinProps {
  isLoading?: boolean;
}

export const LoaderWithChildren = ({ isLoading, children }: LoaderWithChildrenProps) => {
  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <Spin indicator={antIcon} spinning={isLoading ?? false}>
      {children}
    </Spin>
  );
};

export const ModalLoader = () => {
  return <LoaderCmp style={{ bottom: 0, right: 0, left: 0, margin: "auto", zIndex: 9, position: "absolute", top: 0 }} />;
};

export const LoaderCmp = (props?: SpinProps) => {
  return <Spin {...props} indicator={<LoadingOutlined style={{ fontSize: 24, ...props?.style }} spin />} />;
};
