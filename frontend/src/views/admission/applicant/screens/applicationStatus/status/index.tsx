import { Badge, CardProps } from "antd";
import { CardCmp } from "src/components/layouts/container";
import Draft from "./draft";
import { useBase } from "src/redux/hooks";
import Submit from "./submit";
import Select from "./select";
import Rejected from "./rejected";
import StudentCreated from "./studentCreated";

interface StatusCardCmpProps extends CardProps {
  text: string;
  color: string;
}
export const StatusCardCmp = ({ text, color, ...props }: StatusCardCmpProps) => {
  const { user } = useBase();
  return (
    <Badge.Ribbon text={text} style={{ background: color }}>
      <CardCmp title={`Application Number: ${user?.info?.applicant?.application_no}`} {...props} className={`mt-3 ${props?.className}`} />
    </Badge.Ribbon>
  );
};
export default function StatusCards({ stepper }: { stepper: number }) {
  console.log("stepper: ", stepper);
  if (stepper == 0) return <Draft />;
  else if (stepper == 1) return <Submit />;
  else if (stepper == 2) return <Select />;
  else if (stepper == 3) return <StudentCreated />;
  else if (stepper == 4) return <Rejected />;
}
