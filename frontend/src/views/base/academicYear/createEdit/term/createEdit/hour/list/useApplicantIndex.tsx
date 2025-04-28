import { DeleteOutlined, EyeFilled } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { message } from "antd";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { CheckBoxCmp } from "src/components/styled";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import { useColors } from "src/redux/hooks";
import { getAcademicYearWithId } from "../../../../useCreate";
import { getTermByID } from "../../useCreate";

const deleteRecord = async ({ ids }: { ids: string }) => {
  const response = await axiosInstance.delete(`api/base/hour/${ids}`);
  return response;
};

const getHours = async ({ term_id }) => {
  let url = `api/base/hour`;
  if (term_id) url += `?term_id=${term_id}`;
  const response = await axiosInstance.get(url);
  return response;
};

export default function useApplicant() {
  const [search] = useSearchParams();
  const academic_year_id = search.get("academic_year_id");
  const term_id = search.get("term_id");

  const { data, refetch, isPending } = useQuery({ queryKey: ["get/hours", term_id], queryFn: () => getHours({ term_id }) });
  const { mutate: userDeleteMutate, isPending: isLoadingRoleDelete } = useMutation({ mutationKey: ["delete/role"], mutationFn: deleteRecord });
  const { data: academic_year } = useQuery({ queryKey: ["get/academic-year"], queryFn: () => getAcademicYearWithId({ id: academic_year_id }) });
  const { data: term } = useQuery({ queryKey: ["get/term"], queryFn: () => getTermByID({ id: term_id }) });

  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();
  const { Modal, setIsOpen, isOpen } = useConfirmationModal();
  const { colorError, colorPrimary } = useColors();

  let isAllSelected = useMemo(() => {
    try {
      return data?.response?.rows?.length === selected?.length;
    } catch (error) {
      console.error(error);
    }
  }, [selected, data]);

  const columns = [
    {
      dataIndex: "s.no",
      title: (
        <div>
          <CheckBoxCmp
            checked={isAllSelected}
            onChange={() => {
              if (isAllSelected) setSelected([]);
              else setSelected(() => data?.response?.rows?.map((res) => res?.id));
            }}
            className="me-2"
          />
        </div>
      ),
      align: "center",
    },
    {
      dataIndex: "name",
      title: "Name",
    },
    {
      dataIndex: "time_from",
      title: "Time From",
    },
    {
      dataIndex: "time_to",
      title: "Time To",
    },
    {
      dataIndex: "type",
      title: "Type",
    },
    {
      dataIndex: "actions",
      title: "Actions",
      align: "center",
    },
  ];

  const handleEditOrCreate = (arg?: any) => {
    let str = arg ? `detail?id=${arg?.id}&term_id=${term_id}&academic_year_id=${academic_year_id}` : `detail&term_id=${term_id}?academic_year_id=${academic_year_id}`;
    navigate(str);
  };

  let dataSource = useMemo(() => {
    try {
      return data?.response?.rows?.map((res, index) => ({
        "s.no": (
          <div>
            <CheckBoxCmp
              checked={selected?.includes(res?.id)}
              onChange={() =>
                setSelected((tmp) => {
                  let prev = [...tmp];
                  if (prev?.includes(res?.id)) {
                    let index = prev?.indexOf(res?.id);
                    prev?.splice(index, 1);
                  } else prev?.push(res?.id);
                  return prev;
                })
              }
              className="me-2"
            />
            {/* {index + 1} */}
          </div>
        ),
        key: res?.id,
        name: res?.name,
        time_from: res?.time_from,
        time_to: res?.time_to,
        type: res?.type?.value,
        actions: (
          <div>
            <EyeFilled onClick={() => handleEditOrCreate(res)} style={{ color: colorPrimary, fontSize: 20 }} className="me-3 cp" />
            <DeleteOutlined onClick={() => setIsOpen(res)} style={{ color: colorError, fontSize: 20 }} className=" cp" />
          </div>
        ),
      }));
    } catch (error) {
      console.error("error: ", error);
    }
  }, [data, isAllSelected, selected]);

  const handleDelete = () => {
    let ids = isOpen?.id ?? selected?.join(",");
    setIsOpen(false);
    userDeleteMutate(
      { ids },
      {
        onSuccess: () => {
          message.success("Hour delete successfully");
        },
        onError: (error) => {
          message.error(error?.error);
        },
        onSettled: () => {
          refetch();
          setSelected([]);
        },
      }
    );
  };
  return {
    isLoading: isPending || isLoadingRoleDelete,
    columns,
    dataSource,
    Modal,
    selected,
    setIsOpen,
    handleDelete,
    academic_year,
    term,
  };
}
