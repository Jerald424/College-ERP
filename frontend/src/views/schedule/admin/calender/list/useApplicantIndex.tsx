import { DeleteOutlined, EyeFilled } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { message, Tag } from "antd";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { CheckBoxCmp } from "src/components/styled";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import { makeDDMMYYYYToJsDate, makeJSDateToYYYYMMDD } from "src/functions/handleDate";
import useFetchPaginatedData from "src/hooks/table/useFetchPaginated";
import { useBase, useColors } from "src/redux/hooks";

const deleteRecord = async ({ ids }: { ids: string }) => {
  const response = await axiosInstance.delete(`api/calender/calender/${ids}`);
  return response;
};

export default function useApplicant() {
  const { active_academic_year } = useBase();
  const {
    data: { data, refetch, isPending },
    paginate: { pagination, total_count, setPagination },
  } = useFetchPaginatedData({
    url: `api/calender/calender/${makeJSDateToYYYYMMDD(makeDDMMYYYYToJsDate(active_academic_year?.start_date))}/${makeJSDateToYYYYMMDD(makeDDMMYYYYToJsDate(active_academic_year?.end_date))}`,
  });
  const { mutate: userDeleteMutate, isPending: isLoadingRoleDelete } = useMutation({ mutationKey: ["delete/records"], mutationFn: deleteRecord });

  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();
  const { Modal, setIsOpen, isOpen } = useConfirmationModal();
  const { colorError, colorPrimary } = useColors();
  const [selectedDate, setSelectedDate] = useState();

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
      dataIndex: "title",
      title: "Title",
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
        name: res?.name,
        title: res?.title,
        class: res?.classes?.map((res) => <Tag key={res?.id}>{res?.acronym}</Tag>),
        actions: (
          <div>
            <EyeFilled onClick={() => setSelectedDate(res)} style={{ color: colorPrimary, fontSize: 20 }} className="me-3 cp" />
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
          message.success("Event delete successfully");
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
  return { isLoading: isPending || isLoadingRoleDelete, columns, dataSource, pagination, setPagination, total_count, Modal, selected, setIsOpen, handleDelete, selectedDate, setSelectedDate };
}
