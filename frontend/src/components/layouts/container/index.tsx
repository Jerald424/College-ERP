import { Card, CardProps, Divider, DividerProps } from "antd";
import { Content } from "antd/es/layout/layout";
import { HTMLProps } from "react";
import { useColors } from "src/redux/hooks";

export const Container = (props: HTMLProps<HTMLDivElement>) => {
  const { colorBgContainer, colorBgLayout } = useColors();
  return <Content {...props} className={`p-lg-4 p-2 ${props?.className}`} style={{ backgroundColor: colorBgLayout, ...props?.style }}></Content>;
};

interface CardCmpProps extends CardProps {}
export const CardCmp = ({ ...props }: CardCmpProps) => {
  const { colorBgContainer } = useColors();

  return <Card style={{ backgroundColor: colorBgContainer }} classNames={{ body: "p-lg-3 p-1", ...props?.classNames }} {...props}></Card>;
};

export const DividerCmp = ({ ...props }: DividerProps) => {
  return <Divider {...props} />;
};
