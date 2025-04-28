import { MoreOutlined, PlusOutlined } from "@ant-design/icons";
import { Breadcrumb, Dropdown, Table, Tag } from "antd";
import { isEmpty } from "lodash";
import { CardCmp } from "src/components/layouts/container";
import useApplicant from "./useApplicantIndex";
import { Link, NavLink } from "react-router-dom";
import { useMemo } from "react";

export default function Term() {
  const { isLoading, columns, dataSource, pagination, setPagination, total_count, Modal, selected, setIsOpen, handleDelete, academic_year } = useApplicant();

  let breadCrumbItem = useMemo(() => {
    let items = [{ title: <NavLink to={"/divider/base/academic-year"}>Academic Year</NavLink> }, { title: "Terms" }];
    if (academic_year) items?.splice(1, 0, { title: <NavLink to={`/divider/base/academic-year/detail?id=${academic_year?.id}`}>{academic_year?.name}</NavLink> });

    return items;
  }, [academic_year]);

  return (
    <div>
      <Breadcrumb className="ms-3 mb-2" items={breadCrumbItem} />
      <CardCmp
        title={
          <div>
            <span className="me-3">Term</span>
            <Link to={`detail?academic_year_id=${academic_year?.id}`}>
              <Tag className="cp" color={"blue"} icon={<PlusOutlined />}>
                Create
              </Tag>
            </Link>
            {!isEmpty(selected) && <More setIsOpen={setIsOpen} />}
          </div>
        }
      >
        <Table
          size="small"
          loading={isLoading}
          // bordered
          columns={columns}
          dataSource={dataSource}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: total_count,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20", "30", "40", "100", "200"],
          }}
          onChange={setPagination}
        />
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
