import axiosInstance from "src/axiosInstance";

export const getUsers = async () => {
  const response = await axiosInstance.get("api/base/users");
  return response?.response;
};
