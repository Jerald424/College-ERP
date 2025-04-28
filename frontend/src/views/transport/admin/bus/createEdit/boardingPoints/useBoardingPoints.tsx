import { useMemo, useState } from "react";
import { DeleteOutlined, EyeFilled } from "@ant-design/icons";
import { useColors } from "src/redux/hooks";
import axiosInstance from "src/axiosInstance";
import { useMutation } from "@tanstack/react-query";
import { cloneDeep, isObject } from "lodash";

const deleteBoardingPoint = async ({ id }) => {
  if (!id) return {};
  let response = await axiosInstance.delete(`/api/transport/boarding-point/${id}`);
  return response;
};

export default function useBoardingPoints({ reset, boarding_points_value, refetchBoardingPoint, isEdit }) {
  const [selected, setSelected] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const { colorError } = useColors();

  const { mutate: deleteBoardingPointMutate, isPending: isLoadingBoardingPointDelete } = useMutation({ mutationKey: ["delete/boarding-point"], mutationFn: deleteBoardingPoint });

  let columns = useMemo(() => {
    let arr = [
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

  let dataSource = useMemo(() => {
    try {
      if (isObject(boarding_points_value)) {
        let bp = Object.values(cloneDeep(boarding_points_value))?.sort((a, b) => a?.sequence - b?.sequence);
        return bp?.map((res) => ({
          ...res,
          key: res?.id,
          actions: (
            <div className="daj">
              <DeleteOutlined
                onClick={() => {
                  deleteBoardingPointMutate(
                    { id: res?.id },
                    {
                      onSettled() {
                        refetchBoardingPoint();
                      },
                    }
                  );
                }}
                style={{ color: colorError, fontSize: 20 }}
                className=" cp"
              />
            </div>
          ),
        }));
      }
    } catch (error) {
      console.error(error);
    }
  }, [boarding_points_value]);

  const handleSave = () => {
    try {
      reset((prev) => {
        let tmp = { ...prev };
        if (!tmp["boarding_points"]) tmp["boarding_points"] = {};
        Object.assign(tmp["boarding_points"], { [selected?.id]: selected });
        return tmp;
      });
      setIsOpen(false);
      setSelected(false);
    } catch (error) {
      console.error(error);
    }
  };

  return { columns, dataSource, selected, setSelected, isOpen, setIsOpen, handleSave, isLoadingBoardingPointDelete };
}
