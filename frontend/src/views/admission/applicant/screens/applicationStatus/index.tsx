import { CheckOutlined, CloseOutlined, MailOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { Steps } from "antd";
import { Container } from "src/components/layouts/container";
import StatusCards from "./status";
import useApplicationStatus from "./useApplicationStatus";
import { LoaderWithChildren } from "src/components/styled";

export default function ApplicationStatus() {
  const { is_applicant_loading, stepper } = useApplicationStatus();
  return (
    <Container>
      <LoaderWithChildren isLoading={is_applicant_loading}>
        <Steps
          current={stepper}
          items={[
            {
              title: "Draft",
              icon: <MailOutlined />,
            },
            {
              title: "Submit",
              icon: <CheckOutlined />,
            },

            {
              title: "Selected",
              icon: <SafetyCertificateOutlined />,
            },
            {
              title: "Profile Created",
              icon: <SafetyCertificateOutlined />,
            },
            {
              title: "Rejected",
              icon: <CloseOutlined />,
            },
          ]}
        />
        <StatusCards stepper={stepper} />
      </LoaderWithChildren>
    </Container>
  );
}
