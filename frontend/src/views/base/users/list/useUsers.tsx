import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { message } from "antd";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { CheckBoxCmp } from "src/components/styled";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import useFetchPaginatedData from "src/hooks/table/useFetchPaginated";
import { useColors } from "src/redux/hooks";

const deleteUsers = async ({ ids }: { ids: string }) => {
  const response = await axiosInstance.delete(`api/base/users/${ids}`);
  return response;
};

export default function useUsers() {
  const {
    data: { data, refetch, isPending },
    paginate: { pagination, total_count, setPagination },
  } = useFetchPaginatedData({ total_count_url: "/api/base/users-count", url: "api/base/users" });

  const { colorPrimary, colorError } = useColors();
  const navigate = useNavigate();
  const { Modal, setIsOpen, isOpen } = useConfirmationModal();
  const { mutate: userDeleteMutate, isPending: isLoadingUserDelete } = useMutation({ mutationKey: ["delete/user"], mutationFn: deleteUsers });
  const [selected, setSelected] = useState([]);

  let isAllSelected = useMemo(() => {
    try {
      return data?.response?.length === selected?.length;
    } catch (error) {
      console.error(error);
    }
  }, [selected, data?.response]);

  const handleEditOrCreate = (arg?: any) => {
    let str = arg ? `create?id=${arg?.id}` : "create";
    navigate(str);
  };

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
      title: "User name",
      key: "username",
      dataIndex: "username",
    },
    {
      title: "Password",
      key: "password",
      dataIndex: "password",
    },
    {
      dataIndex: "staff",
      title: "Staff",
    },
    {
      dataIndex: "student",
      title: "Student",
    },
    {
      title: "Actions",
      key: "actions",
      dataIndex: "actions",
      align: "center",
    },
  ];

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

  const dataSource = useMemo(() => {
    try {
      console.log("data?.response: ", data?.response);
      return data?.response?.map((res, index) => ({
        ["s.no"]: (
          <>
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
          </>
        ),
        id: res?.id,
        username: res?.username,
        password: res?.password,
        staff: res?.staff?.name,
        student: res?.student?.applicant?.name,
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

  return { columns, dataSource, isLoading: isPending || isLoadingUserDelete, Modal, selected, handleDelete, setIsOpen, pagination, total_count, setPagination };
}
