import { CheckCircleTwoTone, CloseCircleOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { CardCmp, Container } from "src/components/layouts/container";
import { Heading, ModalLoader, SubHeading } from "src/components/styled";
import { useColors } from "src/redux/hooks";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";

const updateStatus = async ({ enc, status }) => {
  if ([enc, status].some((res) => !res)) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  let response = await axiosInstance.get(`api/leave/email-approval/${status}/${enc}`);
  return response;
};

export default function StaffLeaveEmailApproval() {
  const params = useParams();
  const { colorError, colorSuccess } = useColors();
  const { mutate, isPending, data, error } = useMutation({ mutationKey: ["update/leave-status"], mutationFn: updateStatus });

  useEffect(() => {
    if (params?.status && params?.enc) mutate({ enc: params?.enc, status: params?.status });
  }, []);

  if (isPending) return <ModalLoader />;
  return (
    <Container>
      <CardCmp style={{ maxWidth: "400px", margin: "auto", textAlign: "center" }}>
        {error ? <CloseCircleOutlined style={{ fontSize: "100px", color: colorError }} /> : <CheckCircleTwoTone style={{ fontSize: "100px", color: "#1e8449" }} />}
        <Heading className="mt-3">{error ? "Something went wrong" : "Success"}</Heading>
        <SubHeading>{error?.error ?? data?.message ?? `Leave ${params?.status} successfully`}</SubHeading>
      </CardCmp>
    </Container>
  );
}
