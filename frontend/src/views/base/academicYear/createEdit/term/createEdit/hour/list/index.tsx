import { MoreOutlined, PlusOutlined } from "@ant-design/icons";
import { Breadcrumb, Dropdown, Tag } from "antd";
import { isEmpty } from "lodash";
import { useMemo } from "react";
import { Link, NavLink } from "react-router-dom";
import { CardCmp } from "src/components/layouts/container";
import SequenceTable from "src/components/styled/table/sequenceTable";
import useApplicant from "./useApplicantIndex";

export default function TermHours() {
  const { isLoading, columns, dataSource, Modal, selected, setIsOpen, handleDelete, academic_year, term } = useApplicant();

  let breadCrumbItem = useMemo(() => {
    let items = [{ title: <NavLink to={"/divider/base/academic-year"}>Academic Year</NavLink> }, { title: "Hours" }];
    if (academic_year) {
      items?.splice(
        1,
        0,
        { title: <NavLink to={`/divider/base/academic-year/detail?id=${academic_year?.id}`}>{academic_year?.name}</NavLink> },
        { title: <NavLink to={`/divider/base/academic-year/term?academic_year_id=${academic_year?.id}`}>Terms</NavLink> }
      );
      if (term) items?.splice(-1, 0, { title: <NavLink to={`/divider/base/academic-year/term/detail?academic_year_id=${academic_year?.id}&id=${term?.id}`}>{term?.name}</NavLink> });
    }
    return items;
  }, [academic_year, term]);

  return (
    <div>
      <Breadcrumb className="ms-3 mb-2" items={breadCrumbItem} />
      <CardCmp
        title={
          <div>
            <span className="me-3">Hours</span>
            <Link to={`detail?academic_year_id=${academic_year?.id}&term_id=${term?.id}`}>
              <Tag className="cp" color={"blue"} icon={<PlusOutlined />}>
                Create
              </Tag>
            </Link>
            {!isEmpty(selected) && <More setIsOpen={setIsOpen} />}
          </div>
        }
      >
        <SequenceTable size="small" loading={isLoading} pagination={false} url="api/base/hour-sequence" onEndDrag={(val) => console.log(val)} columns={columns} dataSource={dataSource} />
      </CardCmp>
      <Modal description="To delete term" okButtonProps={{ onClick: handleDelete }} />
    </div>
  );
}

const More = ({ setIsOpen }) => {
  let items = [{ key: 1, label: <span onClick={() => setIsOpen(true)}>Delete</span> }];
  return (
    <Dropdown menu={{ items }} placement="bottomLeft" arrow trigger={["click"]}>
      <Tag className="cp" icon={<MoreOutlined />}></Tag>
    </Dropdown>
  );
};
