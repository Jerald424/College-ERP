import { ArrowDownOutlined, ArrowRightOutlined, FileExcelFilled } from "@ant-design/icons";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { isObject } from "lodash";
import { HTMLProps, useMemo, useState } from "react";
import avatar from "src/assets/color_icon/man.png";
import axiosInstance from "src/axiosInstance";
import { LoaderCmp, ModalCmp, Para } from "src/components/styled";
import { DividerCmp } from "../container";
import { useColors } from "src/redux/hooks";
import { makeJsDateToDDMMYYYY } from "src/functions/handleDate";

const fetchData = async ({ table_names, record_id, items }) => {
  if ([table_names].some((res) => !res)) return {};
  const response = await axiosInstance.get(`api/audit/${table_names}/${record_id}?offset=0&limit=${items}`);
  return response?.response;
};

interface auditLogProps extends HTMLProps<HTMLDivElement> {
  table_names?: string[];
  record_id: number;
}

export default function AuditLog(props: auditLogProps) {
  const [items, setItems] = useState(5);
  const { data, isFetching } = useQuery({
    queryKey: ["get/audit", items],
    queryFn: () => fetchData({ record_id: props?.record_id, table_names: props?.table_names, items }),
    placeholderData: keepPreviousData,
  });

  let counts = useMemo(() => {
    try {
      return { total: data?.count, current: data?.rows?.length };
    } catch (error) {
      console.error(error);
    }
  }, [data]);

  return (
    <div className="mt-4">
      {data?.rows?.map((audit) => (
        <SepAuditRecord key={audit?.id} audit={audit} />
      ))}
      {counts?.current != counts?.total &&
        (isFetching ? (
          <div className="text-center">
            <LoaderCmp />
          </div>
        ) : (
          <Para className="text-center cp" onClick={() => setItems((prev) => prev + 10)}>
            Load More
            <ArrowDownOutlined className="ms-2" />
          </Para>
        ))}
    </div>
  );
}

const SepAuditRecord = ({ audit }) => {
  let img = useMemo(() => {
    if (audit?.applicant?.image) return audit?.applicant?.image;
    else if (audit?.user?.image) return audit?.user?.image;
    else return avatar;
  }, [audit]);

  let name = useMemo(() => {
    if (audit?.applicant?.name) return audit?.applicant?.name;
    else if (audit?.user?.name) return audit?.user?.name;
    else return "Anonyms";
  }, [audit]);

  let object = audit?.operation?.id == "delete" ? audit?.old_values : audit?.new_values;
  let date_time = useMemo(() => {
    try {
      let dt = new Date(audit?.timestamp);
      let [hr, min] = [dt?.getHours(), dt?.getMinutes()];
      return `${makeJsDateToDDMMYYYY(dt)}, ${hr}:${min}`;
    } catch (error) {
      console.error(error);
    }
  }, [audit?.timestamp]);

  return (
    <>
      <div className=" df">
        <img src={img} style={{ height: 30, width: 30, borderRadius: 50, objectFit: "contain" }} />
        <div className="ms-2">
          <Para>{name}</Para>
          <Para>
            {audit?.operation?.value} at {date_time}
          </Para>
          <ul>
            {isObject(object) &&
              Object.entries(object)?.map(([key, value]) => {
                let old_val = audit?.["old_values"]?.[key];

                return (
                  <li key={key}>
                    <span className="fw-medium">{key}: </span>
                    <DisplayValue audit={audit} old_val={old_val} value={value} />
                  </li>
                );
              })}
          </ul>
        </div>
      </div>
      <DividerCmp className="my-2" />
    </>
  );
};

const DisplayValue = ({ old_val, value, audit }) => {
  let is_value_base_64 = value?.includes?.("data:");
  let is_old_base_64 = old_val?.includes?.("data:");
  const [isOpen, setIsOpen] = useState();
  const { colorPrimary } = useColors();

  return (
    <>
      {old_val && audit?.operation?.id !== "delete" && (
        <>
          {is_old_base_64 ? (
            <FileExcelFilled onClick={() => setIsOpen(true)} style={{ color: colorPrimary, fontSize: 20 }} className="cp" />
          ) : [true, false].includes(old_val) ? (
            String(old_val)
          ) : (
            old_val
          )}
          <ArrowRightOutlined className="mx-1" />
        </>
      )}
      {is_value_base_64 ? <FileExcelFilled onClick={() => setIsOpen(true)} style={{ color: colorPrimary, fontSize: 20 }} className="cp" /> : [true, false].includes(value) ? String(value) : value}
      <ModalCmp centered onCancel={() => setIsOpen(false)} open={isOpen} footer={null} closeIcon={null} width={1000}>
        <div className="df">
          {old_val && <iframe src={old_val} width={"100%"} height={500} />}
          <iframe src={value} width={"100%"} height={500} />
        </div>
      </ModalCmp>
    </>
  );
};
