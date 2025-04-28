import { Breadcrumb } from "antd";
import useApplicant from "./useApplicant";
import { CardCmp } from "src/components/layouts/container";
import FormWithHook from "src/components/layouts/form";
import ApplicationFee from "./applicantFee";
import { LoaderWithChildren } from "src/components/styled";
import Ribbon from "antd/es/badge/Ribbon";
import ApplicantReport from "./report";
import AuditLog from "src/components/layouts/audit";

export const applicant_status_color = {
  draft: "orange",
  submit: "blue",
  selected: "green",
  rejected: "red",
  student_created: "purple",
};

export default function AdminApplicantView() {
  const { control, form_data, applicant_fee, isLoading, isLoading_applicant_fee, data, value, refetchApplicant, id } = useApplicant();

  return (
    <div>
      <Breadcrumb className="ms-3 mb-2" items={[{ title: "Applicants", path: "/divider/admission/applicant" }, { title: "Applicant" }]} />
      <LoaderWithChildren isLoading={isLoading}>
        <Ribbon text={data?.response?.status?.value} color={applicant_status_color?.[data?.response?.status?.id]}>
          <CardCmp title={<Header refetchApplicant={refetchApplicant} value={value} form_data={form_data} data={data} />}>
            <FormWithHook is_edit={false} className="grid-2" control={control} data={form_data} />
            <ApplicationFee data={applicant_fee} isLoading={isLoading_applicant_fee} />
          </CardCmp>
        </Ribbon>
      </LoaderWithChildren>
      <AuditLog record_id={id} table_names={["admission_applicant", "applicant_fee"]} />
    </div>
  );
}

const Header = ({ data, value, form_data, refetchApplicant }: { data: any; value: any; form_data: any; refetchApplicant: () => void }) => {
  return (
    <div className="dajc">
      <span className="me-3">
        {data?.response?.name} {data?.response?.application_no}
      </span>
      <ApplicantReport refetchApplicant={refetchApplicant} applicant_data={data?.response} value={value} form_data={form_data} />
    </div>
  );
};
