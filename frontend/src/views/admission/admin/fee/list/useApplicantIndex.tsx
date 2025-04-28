import { EyeFilled, AimOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import useFetchPaginatedData from "src/hooks/table/useFetchPaginated";
import { useColors } from "src/redux/hooks";

const deleteApplicant = async ({ ids }: { ids: string }) => {
  const response = await axiosInstance.delete(`api/admission/application-fee/${ids}`);
  return response;
};

export default function useApplicant() {
  const {
    data: { data, refetch, isPending },
    paginate: { pagination, total_count, setPagination },
  } = useFetchPaginatedData({ url: "api/admission/fee-process-list", is_academic_year_based: true });
  const { mutate: userDeleteMutate, isPending: isLoadingRoleDelete } = useMutation({ mutationKey: ["delete/role"], mutationFn: deleteApplicant });

  const navigate = useNavigate();
  const { colorPrimary } = useColors();

  const columns = [
    {
      dataIndex: "s.no",
      title: "#",
      align: "center",
    },
    {
      dataIndex: "name",
      title: "Name",
    },
    {
      dataIndex: "programme",
      title: "Programme",
    },
    {
      dataIndex: "schedule_name",
      title: "Schedule Name",
    },
    {
      dataIndex: "schedule",
      title: "Schedule",
      align: "right",
    },
    {
      dataIndex: "paid",
      title: "Paid",
      align: "right",
    },
    {
      dataIndex: "due",
      title: "Due",
      align: "right",
    },

    {
      dataIndex: "actions",
      title: "Actions",
      align: "center",
    },
  ];

  const handleEditOrCreate = (arg?: any) => {
    let str = arg ? `collect?id=${arg?.id}` : "collect";
    navigate(str);
  };

  let dataSource = useMemo(() => {
    try {
      return data?.response?.rows?.map((res, index) => ({
        "s.no": index + 1,
        id: res?.id,
        name: res?.name,
        programme: res?.programme?.name,
        schedule_name: res?.applicant_fee?.application_fee?.name,
        schedule: res?.applicant_fee?.application_fee?.amount,
        paid: res?.applicant_fee?.paid,
        due: res?.applicant_fee?.application_fee?.amount - res?.applicant_fee?.paid,
        actions: (
          <div>
            <AimOutlined style={{ color: colorPrimary, fontSize: 20 }} className=" cp" />
          </div>
        ),
      }));
    } catch (error) {
      console.error("error: ", error);
    }
  }, [data]);

  return { isLoading: isPending || isLoadingRoleDelete, columns, dataSource, pagination, setPagination, total_count, handleEditOrCreate };
}
