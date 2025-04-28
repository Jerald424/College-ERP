import { CardCmp } from "src/components/layouts/container";
import useQuestionAnswers from "./useQuesByAnswer";
import FormWithHook from "src/components/layouts/form";
import ChartReport from "./chart";
import { Breadcrumb } from "antd";
import { NavLink } from "react-router-dom";
import AnswerList from "./list";
import { LoaderWithChildren } from "src/components/styled";

export default function FeedbackQuestionByAnswers() {
  const { control, form_data, data, form_id, isPending } = useQuestionAnswers();
  return (
    <>
      <Breadcrumb
        className="ms-3 mb-2"
        items={[
          { title: <NavLink to={"/divider/feedback/form"}> Feedback Form </NavLink> },
          { title: <NavLink to={`/divider/feedback/form/detail?id=${form_id}`}> Feedback Form </NavLink> },
          { title: "Answer Feedback" },
        ]}
      />
      <LoaderWithChildren isLoading={isPending}>
        <CardCmp title={data?.response?.question?.name} style={{ zIndex: 0 }}>
          <FormWithHook is_edit={false} className="grid-2" control={control} data={form_data} />
          {["dropdown-single", "dropdown-multiple"].includes(data?.response?.question?.type?.id) && <ChartReport data={data} />}
          <AnswerList data={data} />
        </CardCmp>
      </LoaderWithChildren>
    </>
  );
}
