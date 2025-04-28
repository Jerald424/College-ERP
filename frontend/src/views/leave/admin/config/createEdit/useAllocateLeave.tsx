import { useMutation, useQuery } from "@tanstack/react-query";
import { message } from "antd";
import { useMemo, useState } from "react";
import axiosInstance from "src/axiosInstance";
import { CheckBoxCmp } from "src/components/styled";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";

const getStaffWithLeaveCredits = async ({ leave_type_id }) => {
  if (!leave_type_id) return {};
  const response = await axiosInstance.get(`api/leave/staff-leave-credits/${leave_type_id}`);
  return response?.response;
};

const allocateCredits = async ({ leave_type_id, allocate_credits }) => {
  if (!leave_type_id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.post(`api/leave/allocate-leave-credits/${leave_type_id}`, { allocate_credits });
  return response;
};

export default function useAllocateLeave({ leave_type_id }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState([]);

  const {
    data: staffWithLeaveCredits,
    isLoading: isLoadingStaffCredits,
    refetch,
  } = useQuery({
    queryKey: ["get/leave-credits/leave_type_id", leave_type_id],
    queryFn: () => getStaffWithLeaveCredits({ leave_type_id }),
  });
  const { mutate: allocateCreditMutate, isPending: isLoadingAllocateCredits } = useMutation({ mutationKey: ["allocate/leave-credits"], mutationFn: allocateCredits });

  let isAllSelected = useMemo(() => {
    try {
      return staffWithLeaveCredits?.length === selected?.length;
    } catch (error) {
      console.error(error);
    }
  }, [selected, staffWithLeaveCredits]);

  let already_allocated_ids = useMemo(() => {
    try {
      return staffWithLeaveCredits?.filter((res) => res?.staff_leave_configs?.length > 0)?.map((res) => res?.id);
    } catch (error) {
      console.error(error);
    }
  }, [staffWithLeaveCredits]);

  const columns = [
    {
      dataIndex: "s.no",
      title: (
        <div>
          <CheckBoxCmp
            checked={isAllSelected}
            onChange={() => {
              if (isAllSelected) setSelected([]);
              else setSelected(() => staffWithLeaveCredits?.filter((res) => !already_allocated_ids?.includes(res?.id))?.map((res) => res?.id));
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
      dataIndex: "department",
      title: "Department",
    },
  ];

  let dataSource = useMemo(() => {
    try {
      return staffWithLeaveCredits?.map((res, index) => {
        return {
          "s.no": (
            <div>
              <CheckBoxCmp
                disabled={already_allocated_ids?.includes(res?.id)}
                checked={selected?.includes(res?.id)}
                onChange={() =>
                  setSelected((tmp) => {
                    let prev = [...tmp];
                    if (already_allocated_ids?.includes(res?.id)) return;
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
          department: res?.department?.name,
          total_credits: 10,
          taken_credits: 10,
        };
      });
    } catch (error) {
      console.error(error);
    }
  }, [staffWithLeaveCredits, selected]);

  const onSubmit = () => {
    allocateCreditMutate(
      { allocate_credits: { staff_ids: selected }, leave_type_id },
      {
        onSettled: () => {
          refetch();
          setSelected([]);
        },
        onError: (error) => {
          message.error(error?.error);
        },
        onSuccess: () => {
          message.success("Leave credits allocated successfully");
          setIsOpen(false);
        },
      }
    );
  };

  return { isOpen, setIsOpen, columns, dataSource, isLoadingStaffCredits, isLoadingAllocateCredits, onSubmit };
}
