import { useBase, useColors } from "src/redux/hooks";
import { StatusCardCmp } from ".";
import { Alert, Table } from "antd";
import { Link } from "react-router-dom";
import axiosInstance from "src/axiosInstance";
import { REQUIRED_FIELDS_ARE_MISSING } from "src/utils/colors";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ButtonCmp, CheckBoxCmp, InputBox, InputBoxWithHK } from "src/components/styled";
import { useForm, useWatch } from "react-hook-form";

const getApplicantFee = async ({ applicant_id }: { applicant_id: number }) => {
  if (!applicant_id) throw new Error(REQUIRED_FIELDS_ARE_MISSING);
  const response = await axiosInstance.get(`api/admission/applicant-fee/${applicant_id}`);
  return response?.response;
};

export default function Submit() {
  const { blue } = useColors();
  const {
    user: { login, info },
  } = useBase();
  const { mutate, isPending, data } = useMutation({ mutationKey: ["get/applicant-fee"], mutationFn: getApplicantFee });
  const [selected, setSelected] = useState<any>({});
  const { control, handleSubmit, setValue } = useForm();
  const amt = useWatch({ control });

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
    {
      title: "To Pay",
      dataIndex: "to_pay",
      key: "to_pay",
    },
  ];
  const dataSource = useMemo(() => {
    try {
      let due_amt = data?.application_fee?.amount - data?.paid;
      return [
        {
          ["s.no"]: (
            <CheckBoxCmp
              checked={selected?.[data?.id]}
              onChange={(e) => {
                let val = e?.target?.checked;
                if (!val) setValue(String(data?.id), null);
                setSelected((prev) => ({ ...prev, [data?.id]: val }));
              }}
            />
          ),
          key: data?.id,
          name: data?.application_fee?.name,
          amount: data?.application_fee?.amount,
          paid: data?.paid,
          due: due_amt,
          to_pay: (
            <InputBoxWithHK
              rules={{ max: { value: due_amt, message: "Must be less than or equal to due." } }}
              control={control}
              name={String(data?.id)}
              inputProps={{ disabled: !selected?.[data?.id], type: "number" }}
            />
          ),
        },
      ];
    } catch (error) {
      console.error(error);
    }
  }, [data, selected]);

  let is_amt_entered = useMemo(() => {
    try {
      return Object.values(amt)?.some((res) => !!res);
    } catch (error) {
      console.error(error);
    }
  }, [amt]);

  useEffect(() => {
    if (info?.role === "applicant") mutate({ applicant_id: info?.applicant?.id });
  }, [login]);

  return (
    <StatusCardCmp
      text="Submit"
      color={blue}
      actions={[
        <div className="ae me-3">
          <ButtonCmp
            disabled={!is_amt_entered}
            onClick={handleSubmit((data) => {
              console.log("#############", data);
            })}
          >
            Pay
          </ButtonCmp>
        </div>,
      ]}
    >
      <Alert
        banner
        message={
          <>
            Your application is submit. You can edit your application {"    "}
            <Link to={"/admission/index/form"}>Edit</Link> <br />
            You can pay your application fee. Once you pay full application fee you move into selection process
          </>
        }
      />
      <Table loading={isPending} bordered className="mt-3" pagination={false} dataSource={dataSource} columns={columns} />
    </StatusCardCmp>
  );
}
