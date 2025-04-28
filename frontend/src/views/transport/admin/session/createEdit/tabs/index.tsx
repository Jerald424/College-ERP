import { Tabs, TabsProps } from "antd";
import Passenger from "./passenger";
import Incharge from "./incharge";
import axiosInstance from "src/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import { LoaderWithChildren } from "src/components/styled";

const getPassengerIncharge = async () => {
  const response = await axiosInstance.get("api/transport/passengers/incharge-support-data");
  return response;
};

export default function BSTabs({ control, is_edit }) {
  const { data: users, isLoading } = useQuery({ queryKey: ["get/passenger-incharge"], queryFn: getPassengerIncharge });

  const items: TabsProps["items"] = [
    {
      key: "passenger",
      label: "Passenger",
      children: <Passenger users={users} control={control} is_edit={is_edit} />,
    },
    {
      key: "incharge",
      label: "Incharge",
      children: <Incharge users={users} control={control} is_edit={is_edit} />,
    },
  ];

  return (
    <LoaderWithChildren isLoading={isLoading}>
      <Tabs defaultActiveKey="passenger" items={items} />
    </LoaderWithChildren>
  );
}
