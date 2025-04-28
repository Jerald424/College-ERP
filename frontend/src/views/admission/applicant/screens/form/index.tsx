import { BankOutlined, UserOutlined, UserSwitchOutlined } from "@ant-design/icons";
import { Steps } from "antd";
import { useTransition } from "react";
import { Link } from "react-router-dom";
import { CardCmp, Container } from "src/components/layouts/container";
import { ButtonCmp, LoaderCmp, LoaderWithChildren } from "src/components/styled";
import { useColors } from "src/redux/hooks";
import AcademicsFields from "./steps/academics";
import BasicFields from "./steps/basic";
import PersonalFields from "./steps/personal";
import useFormIndex from "./useIndex";

export default function ApplicationForm() {
  const { support_data, control, handleSubmit, isPending, setValue, stepper, setStepper, isLogin, Modal, setIsOpen, makeSubmit, applicant_data } = useFormIndex();
  const [isTransition, setTransition] = useTransition();
  const { colorWarning } = useColors();
  return (
    <Container>
      <Steps
        onChange={(val) => {
          isLogin &&
            setTransition(() => {
              setStepper(val);
            });
        }}
        current={stepper}
        items={[
          {
            title: "Basic",
            icon: isTransition ? <LoaderCmp /> : <UserOutlined />,
          },
          {
            title: "Academics",
            icon: isTransition ? <LoaderCmp /> : <BankOutlined />,
          },
          {
            title: "Personal",
            icon: isTransition ? <LoaderCmp /> : <UserSwitchOutlined />,
          },
        ]}
      />
      <form onSubmit={handleSubmit}>
        <LoaderWithChildren isLoading={isPending}>
          <CardCmp
            className="mt-3"
            actions={[
              <div className="ae me-3">
                <div>
                  <Link to={"/admission/index"}>
                    <ButtonCmp className="me-3" type="link">
                      Discard
                    </ButtonCmp>
                  </Link>
                </div>
                <ButtonCmp htmlType="submit">Save</ButtonCmp>
                {stepper == 2 && applicant_data?.status === "draft" && (
                  <ButtonCmp onClick={() => setIsOpen(true)} style={{ background: colorWarning }} className="ms-3">
                    Submit
                  </ButtonCmp>
                )}
              </div>,
            ]}
          >
            {stepper == 0 && <BasicFields applicant_data={applicant_data} support_data={support_data} control={control} />}
            {stepper == 1 && <AcademicsFields control={control} />}
            {stepper == 2 && <PersonalFields setValue={setValue} support_data={support_data} control={control} />}
          </CardCmp>
        </LoaderWithChildren>
      </form>
      <Modal description="your application will be moved into Submit status." okButtonProps={{ onClick: makeSubmit }} />
    </Container>
  );
}
