import { Typography } from "antd";

const { Title, Paragraph, Text } = Typography;

type TitleProps = React.ComponentProps<typeof Title>;

const Heading = ({ ...props }: TitleProps) => {
  return <Title {...props} style={{ fontSize: "20px", ...props?.style }} />;
};
const SubHeading = ({ ...props }: TitleProps) => {
  return <Title {...props} style={{ fontSize: "18px", ...props?.style }} />;
};

export type ParagraphProps = React.ComponentProps<typeof Paragraph>;

const Para = ({ ...props }: ParagraphProps) => {
  return <Paragraph {...props} className={`mb-0 ${props?.className}`} />;
};

type TextCmpProps = React.ComponentProps<typeof Text>;

const TextCmp = ({ ...props }: TextCmpProps) => {
  return <Text {...props}></Text>;
};

export { Heading, Para, TextCmp, SubHeading };
