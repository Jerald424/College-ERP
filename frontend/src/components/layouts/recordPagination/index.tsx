import { useQuery } from "@tanstack/react-query";
import { message, Pagination } from "antd";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { LoaderCmp } from "src/components/styled";

const getIds = async ({ api_name }) => {
  if (!api_name) return {};
  const response = await axiosInstance.get(api_name);
  return response?.response;
};

interface RecordPaginationProps {
  api_name: string;
  id?: number;
  handleChangePage?: (arg: number) => void;
}
export default function RecordPagination({ handleChangePage, ...props }: RecordPaginationProps) {
  const { data, isLoading } = useQuery({ queryKey: [props?.api_name], queryFn: () => getIds({ api_name: props?.api_name }) });
  const [search, setSearch] = useSearchParams();

  let sel_id = props?.id ?? search.get("id");
  let ids = useMemo(() => {
    try {
      return data?.map((res) => res?.id);
    } catch (error) {
      console.error(error);
    }
  }, [data]);

  let sel_index = useMemo(() => {
    try {
      return ids?.indexOf(+sel_id);
    } catch (error) {
      console.error(error);
    }
  }, [sel_id, ids]);

  const handleChange = (index) => {
    try {
      let elem = ids?.[index - 1];
      if (elem) {
        if (handleChangePage) handleChangePage?.(elem);
        else setSearch((prev) => ({ ...prev, id: elem }));
      } else message.error("Something wrong");
    } catch (error) {
      console.error(error);
    }
  };
  if (isLoading) return <LoaderCmp />;
  return <Pagination onChange={handleChange} current={sel_index + 1} size="small" defaultCurrent={1} total={ids?.length} pageSize={1} />;
}
