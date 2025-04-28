import { DeleteOutlined, EyeFilled } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { message } from "antd";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { CheckBoxCmp, SwitchCmp } from "src/components/styled";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import useFetchPaginatedData from "src/hooks/table/useFetchPaginated";
import { useColors } from "src/redux/hooks";
import { getAcademicYearWithId } from "../../useCreate";

const deleteRecord = async ({ ids }: { ids: string }) => {
  const response = await axiosInstance.delete(`api/base/term/${ids}`);
  return response;
};

export default function useApplicant() {
  const [search] = useSearchParams();
  const academic_year_id = search.get("academic_year_id");
  const {
    data: { data, refetch, isPending },
    paginate: { pagination, total_count, setPagination },
  } = useFetchPaginatedData({ url: `api/base/term`, query: `&academic_year_id=${academic_year_id}` });

  const { mutate: userDeleteMutate, isPending: isLoadingRoleDelete } = useMutation({ mutationKey: ["delete/role"], mutationFn: deleteRecord });
  const { data: academic_year } = useQuery({ queryKey: ["get/academic-year"], queryFn: () => getAcademicYearWithId({ id: academic_year_id }) });

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
          />{" "}
          #
        </div>
      ),
      align: "center",
    },
    {
      dataIndex: "name",
      title: "Name",
    },
    {
      dataIndex: "start_date",
      title: "Start Date",
    },
    {
      dataIndex: "end_date",
      title: "End Date",
    },
    {
      dataIndex: "is_active",
      title: "Active",
      align: "center",
    },
    {
      dataIndex: "actions",
      title: "Actions",
      align: "center",
    },
  ];

  const handleEditOrCreate = (arg?: any) => {
    let str = arg ? `detail?id=${arg?.id}&academic_year_id=${academic_year_id}` : `detail?academic_year_id=${academic_year_id}`;
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
            {index + 1}
          </div>
        ),
        name: res?.name,
        start_date: res?.start_date,
        end_date: res?.end_date,
        is_active: <SwitchCmp checked={res?.is_active} />,
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
          message.success("Term delete successfully");
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
    pagination,
    setPagination,
    total_count,
    Modal,
    selected,
    setIsOpen,
    handleDelete,
    academic_year,
  };
}
