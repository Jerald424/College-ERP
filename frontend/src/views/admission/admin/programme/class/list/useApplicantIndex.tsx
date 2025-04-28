import { DeleteOutlined, EyeFilled } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { message } from "antd";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { CheckBoxCmp } from "src/components/styled";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import useFetchPaginatedData from "src/hooks/table/useFetchPaginated";
import { useColors } from "src/redux/hooks";
import { getProgramme } from "../../createEdit/useCreate";

const deleteApplicant = async ({ ids }: { ids: string }) => {
  const response = await axiosInstance.delete(`api/programme/class/${ids}`);
  return response;
};

export default function useApplicant() {
  const route = useParams();

  const {
    data: { data, refetch, isPending },
    paginate: { pagination, total_count, setPagination },
  } = useFetchPaginatedData({ url: `api/programme/class`, query: `&programme_id=${route?.programme_id}` });
  const { mutate: userDeleteMutate, isPending: isLoadingRoleDelete } = useMutation({ mutationKey: ["delete/role"], mutationFn: deleteApplicant });
  const { data: programme, isLoading: isLoadingProgramme } = useQuery({ queryKey: ["get/programme"], queryFn: () => getProgramme({ id: route?.programme_id }) });

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
      dataIndex: "acronym",
      title: "Acronym",
    },
    {
      dataIndex: "actions",
      title: "Actions",
      align: "center",
    },
  ];

  const handleEditOrCreate = (arg?: any) => {
    let str = arg ? `/divider/admission/class/${programme?.id}/detail?id=${arg?.id}` : `/divider/admission/class/${programme?.id}/detail`;
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
        acronym: res?.acronym,
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
          message.success("Class delete successfully");
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
  return { isLoading: isPending || isLoadingRoleDelete || isLoadingProgramme, columns, dataSource, pagination, setPagination, total_count, Modal, selected, setIsOpen, handleDelete, programme };
}
