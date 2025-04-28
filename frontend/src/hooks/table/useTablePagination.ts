import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";

const getTotalRecordCount = async ({ url }: { url: string }) => {
  if (!url) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get(url);
  return response?.response;
};

interface useTablePaginationProps {
  url?: string;
}
export default function useTablePagination(arg?: useTablePaginationProps) {
  const { data: total_count, ...rest } = useQuery({ queryKey: ["get/total/records"], queryFn: () => getTotalRecordCount({ url: arg?.url }) });
  const [search, setSearch] = useSearchParams();
  // const [pagination, setPagination] = useState({
  //   current: 1,
  //   pageSize: 10,
  // });
  const pagination = {
    current: 1,
    pageSize: 10,
  };
  for (let [key, value] of search.entries()) {
    pagination[key] = value;
  }

  const setPagination = (arg: any) => {
    setSearch({ current: arg?.current, pageSize: arg?.pageSize });
  };

  return { pagination, total_count, setPagination, ...rest };
}
