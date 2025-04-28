import { useMemo, useState } from "react";
import { DeleteOutlined, EditFilled } from "@ant-design/icons";
import { useColors } from "src/redux/hooks";

export default function useQuestionOptions({ watch, reset, isEdit }) {
  const [state, setState] = useState(false);
  const { colorError, colorPrimary } = useColors();

  const columns = useMemo(() => {
    let arr = [
      {
        dataIndex: "s.no",
        title: "#",
        align: "center",
      },
      {
        dataIndex: "name",
        title: "Name",
      },
    ];
    if (isEdit)
      arr.push({
        dataIndex: "actions",
        title: "Actions",
        align: "center",
      });

    return arr;
  }, [isEdit]);

  const option = watch("option");

  const handleSave = () => {
    try {
      reset((prev) => {
        let tmp = { ...prev };
        tmp["option"] = tmp["option"] ?? {};
        Object.assign(tmp?.option, { [state?.id]: state });
        return tmp;
      });
      setState(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = ({ id }) => {
    try {
      if (!id?.includes("static"))
        reset((prev) => {
          let tmp = { ...prev };
          if (!tmp["deleted"]) tmp["deleted"] = [];
          tmp["deleted"]?.push(id);
          return tmp;
        });
      reset((prev) => {
        let tmp = { ...prev };
        delete tmp["option"][id];
        return tmp;
      });
    } catch (error) {
      console.error(error);
    }
  };

  let dataSource = useMemo(() => {
    try {
      return Object?.entries(option)?.map(([key, value], index) => ({
        "s.no": index + 1,
        name: value?.name,
        actions: (
          <div>
            <EditFilled onClick={() => setState(value)} style={{ color: colorPrimary, fontSize: 20 }} className="me-3 cp" />
            <DeleteOutlined onClick={() => handleDelete({ id: key })} style={{ color: colorError, fontSize: 20 }} className=" cp" />
          </div>
        ),
      }));
    } catch (error) {
      console.error(error);
    }
  }, [option]);

  return { columns, state, setState, handleSave, dataSource };
}
