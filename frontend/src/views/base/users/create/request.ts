import axiosInstance from "src/axiosInstance";

export const getRoles = async () => {
  const response = await axiosInstance.get("api/base/roles");
  return response?.response;
};
