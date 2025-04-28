import { useMutation } from "@tanstack/react-query";
import { getApplicant } from "../form/useIndex";
import { useEffect, useMemo } from "react";
import { useBase } from "src/redux/hooks";

export default function useApplicationStatus() {
  const { data: applicant_data, isPending: is_applicant_loading, mutate: getApplicantMutate } = useMutation({ mutationKey: ["get/applicant"], mutationFn: getApplicant });
  console.log("applicant_data: ", applicant_data);
  const { user } = useBase();

  let stepper = useMemo(() => {
    return ["draft", "submit", "selected", "student_created", "rejected"].findIndex((res) => applicant_data?.status === res);
  }, [applicant_data]);

  useEffect(() => {
    if (user?.login && user?.info?.role === "applicant") getApplicantMutate({ id: user?.info?.applicant?.id });
  }, [user]);

  return { stepper, is_applicant_loading };
}
