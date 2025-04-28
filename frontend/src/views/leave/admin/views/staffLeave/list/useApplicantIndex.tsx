import { ArrowRightOutlined, DeleteOutlined, EyeFilled } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Tag, Tooltip, message } from "antd";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { CheckBoxCmp, Para } from "src/components/styled";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import useFetchPaginatedData from "src/hooks/table/useFetchPaginated";
import { useBase, useColors } from "src/redux/hooks";
import { leave_status_color } from "../createEdit";

const deleteRecord = async ({ ids }: { ids: string }) => {
  const response = await axiosInstance.delete(`api/leave/leave/${ids}`);
  return response;
};

export default function useApplicant() {
  const {
    user: { info },
  } = useBase();
  let staff_id_query = info?.role !== "college" ? `&staff_id=${info?.user?.staff_id}` : "";
  const {
    data: { data, refetch, isPending },
    paginate: { pagination, total_count, setPagination },
  } = useFetchPaginatedData({ url: "api/leave/leave", query: `&leave_attributes=id,start_date,end_date,reason,status&staff_leave_config_attributes=id,code,name${staff_id_query}` });
  const { mutate: userDeleteMutate, isPending: isLoadingRoleDelete } = useMutation({ mutationKey: ["delete/records"], mutationFn: deleteRecord });

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
      dataIndex: "staff",
      title: "Staff",
    },
    {
      dataIndex: "date",
      title: "Date",
    },
    {
      dataIndex: "type",
      title: "Type",
    },
    {
      dataIndex: "status",
      title: "Status",
      align: "center",
    },
    {
      dataIndex: "actions",
      title: "Actions",
      align: "center",
    },
  ];

  const handleEditOrCreate = (arg?: any) => {
    let str = arg ? `detail?id=${arg?.id}` : "detail";
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
        staff: (
          <div>
            <img src={res?.staff?.image} style={{ height: 50, width: 50, borderRadius: 50, objectFit: "cover" }} />
            &nbsp;
            {res?.staff?.name}
          </div>
        ),
        date: (
          <div>
            {res?.start_date} <ArrowRightOutlined /> {res?.end_date}
          </div>
        ),
        type: res?.staff_leave_config?.name,
        status: <Tag color={leave_status_color?.[res?.status?.id] ?? "blue"}>{res?.status?.value}</Tag>,
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
          message.success("Leave  delete successfully");
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
  return { isLoading: isPending || isLoadingRoleDelete, columns, dataSource, pagination, setPagination, total_count, Modal, selected, setIsOpen, handleDelete };
}
