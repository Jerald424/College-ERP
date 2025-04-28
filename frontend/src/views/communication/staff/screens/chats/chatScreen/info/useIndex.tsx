import { useMutation, useQuery } from "@tanstack/react-query";
import { isEmpty } from "lodash";
import { useEffect, useMemo } from "react";
import axiosInstance from "src/axiosInstance";
import { useBase } from "src/redux/hooks";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";
import { socket } from "src/views/communication/staff";
import { useCommunicationMainSlice } from "src/views/communication/staff/redux/store";

const updateGroupInfo = async ({ group_id, group, ...rest }) => {
  const response = await axiosInstance.put(`api/communication/update-group-info/${group_id}`, { group, ...rest });
  return response;
};
export const updateProfileInfo = () => {
  const { mutate: updateGroup, isPending } = useMutation({ mutationKey: ["update/group"], mutationFn: updateGroupInfo });
  return { updateGroup, isPending };
};

export const deleteGroup = async ({ id }) => {
  if (!id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.delete(`api/communication/delete-group/${id}`);
  return response;
};

const getGroupMembers = async ({ group_id }) => {
  if (!group_id) return {};
  const response = await axiosInstance.get(`api/communication/group-members/${group_id}`);
  return response;
};

export const useGroupMembers = () => {
  const {
    chats: { selected_contact },
  } = useCommunicationMainSlice();
  const {
    user: { info },
  } = useBase();
  const {
    data: group_members,
    isLoading: isLoadingGroupMembers,
    refetch,
  } = useQuery({ queryKey: ["get/group-members", selected_contact], queryFn: () => getGroupMembers({ group_id: selected_contact?.id }) });

  let group_admins = useMemo(() => {
    try {
      return group_members?.response?.admins?.map((res) => res?.userId);
    } catch (error) {
      console.error(error);
    }
  }, [group_members]);

  let group_members_data = useMemo(() => {
    try {
      const members = group_members?.response?.members?.map((res) => {
        res["is_admin"] = group_admins?.includes(res?.id);
        return res;
      });
      return members;
    } catch (error) {
      console.error(error);
    }
  }, [group_members]);

  let is_group_admin = useMemo(() => group_admins?.includes(info?.user?.id), [info, group_admins]);

  useEffect(() => {
    socket.on("group_updated", (data) => {
      console.log("data: GROUP UPDATED IN RIGHT BAR ", data);
      if (!isEmpty(data?.added_user) || !isEmpty(data?.removed_user) || !isEmpty(data?.added_group_admins) || !isEmpty(data?.removed_group_admins)) refetch();
    });
  }, [socket]);

  return { group_members_data, is_group_admin, isLoadingGroupMembers };
};
