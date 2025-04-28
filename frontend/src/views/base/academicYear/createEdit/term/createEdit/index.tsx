import { CloseCircleFilled, EditFilled, SaveFilled } from "@ant-design/icons";
import { Breadcrumb, Tag } from "antd";
import { CardCmp } from "src/components/layouts/container";
import FormWithHook from "src/components/layouts/form";
import { LoaderWithChildren } from "src/components/styled";
import useCreate, { getHourCount } from "./useCreate";
import { useMemo } from "react";
import { Link, NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

export default function TermCreateEdit() {
  const { control, form_data, record_id, Modal, handleSubmit, navigate, isLoading, onSubmit, isEdit, setIsEdit, academic_year, term } = useCreate();

  let breadcrumbData = useMemo(() => {
    let arr = [{ title: "Academic Year", path: "/divider/base/academic-year" }, { title: record_id ? "Update term" : "Create term" }];
    if (academic_year)
      arr.splice(
        1,
        0,
        { title: <NavLink to={`/divider/base/academic-year/detail?id=${academic_year?.id}`}>{academic_year?.name}</NavLink> },
        { title: <NavLink to={`/divider/base/academic-year/term?academic_year_id=${academic_year?.id}`}>Term</NavLink> }
      );
    return arr;
  }, [academic_year, term]);

  return (
    <div>
      <Breadcrumb className="ms-3 mb-2" items={breadcrumbData} />
      <LoaderWithChildren isLoading={isLoading}>
        <form onSubmit={handleSubmit}>
          <CardCmp title={<Header academic_year_id={academic_year?.id} isEdit={isEdit} setIsEdit={setIsEdit} record_id={record_id} />} className="mt-2">
            <FormWithHook is_edit={isEdit || !record_id} className="col-lg-6" control={control} data={form_data} />
          </CardCmp>
        </form>
      </LoaderWithChildren>
      <Modal description={record_id ? "Update term" : "Create term"} okButtonProps={{ onClick: onSubmit }} />
    </div>
  );
}

const Header = ({ record_id, isEdit, setIsEdit, academic_year_id }: { record_id: number; isEdit: boolean; setIsEdit: React.Dispatch<React.SetStateAction<boolean>>; academic_year_id: number }) => {
  const { data } = useQuery({ queryKey: ["get/hour-count"], queryFn: () => getHourCount({ term_id: record_id }) });

  return (
    <div className="dajc">
      <div className="f1">
        {record_id ? "Update term" : "Create term"}
        {isEdit || !record_id ? (
          <>
            {record_id && (
              <Tag onClick={() => setIsEdit(false)} className="ms-3 cp" color="error" icon={<CloseCircleFilled />}>
                Discard
              </Tag>
            )}
            <>
              <label htmlFor="save">
                <Tag className="ms-3 cp" color="success" icon={<SaveFilled />}>
                  Save
                </Tag>
              </label>
              <button className="d-none" id="save" />
            </>
          </>
        ) : (
          <Tag onClick={() => setIsEdit(true)} className="ms-3 cp" color="blue" icon={<EditFilled />}>
            Edit
          </Tag>
        )}
      </div>
      {record_id && (
        <div>
          <Link to={`/divider/base/academic-year/term/hour?academic_year_id=${academic_year_id}&term_id=${record_id}`}>Hours [{data?.count}]</Link>
        </div>
      )}
    </div>
  );
};
