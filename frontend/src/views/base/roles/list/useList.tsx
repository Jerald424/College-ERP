import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import axiosInstance from "src/axiosInstance";
import { CheckBoxCmp } from "src/components/styled";
import useFetchPaginatedData from "src/hooks/table/useFetchPaginated";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useColors } from "src/redux/hooks";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import { message } from "antd";

const deleteRoles = async ({ ids }: { ids: string }) => {
  const response = await axiosInstance.delete(`api/base/roles/${ids}`);
  return response;
};

export default function useList() {
  const {
    data: { data, refetch, isPending },
    paginate: { pagination, total_count, setPagination },
  } = useFetchPaginatedData({ total_count_url: "/api/base/roles-count", url: "api/base/roles" });
  const { mutate: userDeleteMutate, isPending: isLoadingRoleDelete } = useMutation({ mutationKey: ["delete/role"], mutationFn: deleteRoles });

  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();
  const { colorPrimary, colorError } = useColors();
  const { Modal, setIsOpen, isOpen } = useConfirmationModal();

  let isAllSelected = useMemo(() => {
    try {
      return data?.response?.length === selected?.length;
    } catch (error) {
      console.error(error);
    }
  }, [selected, data?.response]);

  const columns = [
    {
      title: (
        <>
          <CheckBoxCmp
            checked={isAllSelected}
            onChange={() => {
              if (isAllSelected) setSelected([]);
              else setSelected(() => data?.response?.map((res) => res?.id));
            }}
            className="me-2"
          />
          #
        </>
      ),

      key: "s.no",
      dataIndex: "s.no",
      align: "center",
    },
    {
      dataIndex: "name",
      title: "Name",
    },
    {
      dataIndex: "level",
      title: "Level",
    },

    {
      dataIndex: "actions",
      title: "Actions",
      align: "center",
    },
  ];

  const handleEditOrCreate = (arg?: any) => {
    let str = arg ? `create?id=${arg?.id}` : "create";
    navigate(str);
  };

  const handleDelete = () => {
    let ids = isOpen?.id ?? selected?.join(",");
    setIsOpen(false);
    userDeleteMutate(
      { ids },
      {
        onSuccess: () => {
          message.success("User delete successfully");
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

  let dataSource = useMemo(() => {
    try {
      return data?.response?.map((res, index) => ({
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
        level: res?.level_id,
        actions: (
          <div>
            <EditOutlined onClick={() => handleEditOrCreate(res)} style={{ color: colorPrimary, fontSize: 20 }} className="me-3 cp" />
            <DeleteOutlined onClick={() => setIsOpen(res)} style={{ color: colorError, fontSize: 20 }} className=" cp" />
          </div>
        ),
      }));
    } catch (error) {
      console.error(error);
    }
  }, [data, selected]);

  return { isLoading: isPending || isLoadingRoleDelete, columns, dataSource, pagination, setPagination, total_count, Modal, selected, setIsOpen, handleDelete };
}
