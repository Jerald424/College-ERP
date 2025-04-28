import { Table } from "antd";
import { useMemo } from "react";
import { DividerCmp } from "src/components/layouts/container";
import { SubHeading } from "src/components/styled";

export default function ApplicationFee({ isLoading, data }) {
  let app_fee = data?.response;

  const columns = [
    {
      title: "#",
      dataIndex: "s.no",
      key: "s.no",
      align: "center",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "right",
    },
    {
      title: "Paid",
      dataIndex: "Paid",
      key: "Paid",
      align: "right",
    },
    {
      title: "Due",
      dataIndex: "due",
      key: "due",
      align: "right",
    },
  ];
  const dataSource = useMemo(() => {
    try {
      let due_amt = app_fee?.application_fee?.amount - app_fee?.paid;
      return [
        {
          ["s.no"]: 1,
          key: app_fee?.id,
          name: app_fee?.application_fee?.name,
          amount: app_fee?.application_fee?.amount,
          paid: app_fee?.paid,
          due: due_amt,
        },
      ];
    } catch (error) {
      console.error(error);
    }
  }, [data]);

  return (
    <div className="mt-3">
      <SubHeading>Applicant Fees</SubHeading>
      <DividerCmp className="mt-0" />
      <Table
        size="small"
        loading={isLoading}
        // bordered
        columns={columns}
        dataSource={dataSource}
        pagination={false}
      />
    </div>
  );
}
