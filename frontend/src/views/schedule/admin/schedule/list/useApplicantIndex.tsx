import { DeleteOutlined, EyeFilled } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Tag, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { CheckBoxCmp } from "src/components/styled";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import useFetchPaginatedData from "src/hooks/table/useFetchPaginated";
import { useColors } from "src/redux/hooks";
import { getTerms } from "../../calender/eventCreate/useEventCreate";
import { isEmpty } from "lodash";

const deleteRecord = async ({ ids }: { ids: string }) => {
  const response = await axiosInstance.delete(`api/schedule/schedule/${ids}`);
  return response;
};

export default function useApplicant() {
  const [selectedTerm, setSelectedTerm] = useState();
  const {
    data: { data, refetch, isPending },
    paginate: { pagination, total_count, setPagination },
  } = useFetchPaginatedData({ url: selectedTerm ? `api/schedule/schedules/${selectedTerm}` : null });
  const { mutate: userDeleteMutate, isPending: isLoadingRoleDelete } = useMutation({ mutationKey: ["delete/records"], mutationFn: deleteRecord });
  const { data: terms, isLoading: isLoadingTerms } = useQuery({ queryKey: ["get/terms"], queryFn: getTerms });

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
      dataIndex: "date",
      title: "Date",
    },
    {
      dataIndex: "hour",
      title: "Hour",
    },
    {
      dataIndex: "day",
      title: "Day",
    },
    {
      dataIndex: "course",
      title: "Course",
    },
    {
      dataIndex: "status",
      title: "Status",
    },
    {
      dataIndex: "staffs",
      title: "Staffs",
    },
    {
      dataIndex: "class",
      title: "Class",
    },
    {
      dataIndex: "actions",
      title: "Actions",
      align: "center",
    },
  ];

  const handleEditOrCreate = (arg?: any) => {
    let str = arg ? `detail/${arg?.id}` : "detail";
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
        date: res?.date,
        hour: res?.timetable?.hour?.name,
        status: <Tag color={res?.status?.id == "not_marked" ? "gold" : "green"}> {res?.status?.value}</Tag>,
        day: res?.timetable?.day?.value,
        course: res?.timetable?.course?.name,
        class: res?.timetable?.classes?.map((res) => <Tag key={res?.id}>{res?.acronym}</Tag>),
        staffs: res?.timetable?.staffs?.map((staff) => (
          <Tag color="blue" key={res?.id + staff?.id}>
            {staff?.name}
          </Tag>
        )),
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
          message.success("Schedule delete successfully");
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

  useEffect(() => {
    if (!isEmpty(terms)) setSelectedTerm(terms?.rows?.[0]?.id);
  }, [terms]);
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
    terms,
    setSelectedTerm,
    selectedTerm,
  };
}
