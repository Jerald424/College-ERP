import { useQuery } from "@tanstack/react-query";
import axiosInstance from "src/axiosInstance";

const getUsers = async () => {
  const response = await axiosInstance.get("api/communication/new-chat-list");
  return response?.response;
};

export default function useNewChat() {
  const { data: users, isLoading } = useQuery({ queryKey: ["get/users"], queryFn: getUsers });

  return { users, isLoading };
}
