import { useQuery } from "@tanstack/react-query";
import axiosInstance from "src/axiosInstance";
import useTablePagination from "./useTablePagination";
import { useBase } from "src/redux/hooks";

const getData = async ({ url }: { url: string }) => {
  const response = await axiosInstance.get(url);
  return response;
};

interface useFetchPaginatedDataProps {
  url: string;
  total_count_url?: string;
  is_academic_year_based?: boolean;
  query?: string;
}

export default function useFetchPaginatedData(arg?: useFetchPaginatedDataProps) {
  const { active_academic_year } = useBase();
  const { pagination, setPagination, total_count, refetch: getTotalRecordCount } = useTablePagination({ url: arg?.total_count_url });
  const { ...restGetData } = useQuery({ queryKey: [arg?.url, pagination, active_academic_year], queryFn: () => fetchData({ pagination, active_academic_year }) });

  const fetchData = async ({ pagination, active_academic_year }: { pagination?: any; active_academic_year: any }) => {
    try {
      let url = arg?.url;
      if (!url) return;
      let offset = pagination?.current;
      offset -= 1;
      offset *= pagination?.pageSize;
      url += `?offset=${offset}&limit=${pagination?.pageSize}`;
      if (arg?.is_academic_year_based) url += `&academic_year_id=${active_academic_year?.id}`;
      if (arg?.query) url += arg?.query;
      getTotalRecordCount();
      return await getData({ url });
    } catch (error) {
      console.error(error);
    }
  };

  return { paginate: { pagination, setPagination, total_count: restGetData?.data?.response?.["count"] ?? total_count }, data: { ...restGetData, fetchData } };
}
