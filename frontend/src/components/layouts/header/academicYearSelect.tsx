import { DownCircleFilled } from "@ant-design/icons";
import { Dropdown, Tag } from "antd";
import { useMemo } from "react";
import { useAppDispatch, useBase } from "src/redux/hooks";
import { addEditBase } from "src/redux/reducers/base/reducer";

export default function AcademicYearSelect() {
  const { academic_year, active_academic_year } = useBase();
  const dispatch = useAppDispatch();

  let items = useMemo(() => {
    try {
      return academic_year?.rows?.map((res) => ({ key: res?.id, label: <span onClick={() => dispatch(addEditBase({ key: "active_academic_year", value: res }))}>{res?.name}</span> }));
    } catch (error) {
      console.error(error);
    }
  }, [academic_year]);

  return (
    <Dropdown menu={{ items }} placement="bottomRight" trigger={["click"]}>
      <Tag className="cp">
        {active_academic_year?.name ?? "Select AC"} <DownCircleFilled />
      </Tag>
    </Dropdown>
  );
}
