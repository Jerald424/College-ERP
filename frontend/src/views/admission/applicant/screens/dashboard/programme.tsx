import { EditFilled } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import Card from "antd/es/card/Card";
import axiosInstance from "src/axiosInstance";
import { DividerCmp } from "src/components/layouts/container";
import { FlatList, Heading, Para } from "src/components/styled";

const getProgramme = async () => {
  const response = await axiosInstance.get("/api/admission/get-programme?attributes=programme_programme_level,id,name,image,description");
  return response?.response;
};

export default function Programme() {
  const { data: programme } = useQuery({ queryKey: ["get/programme"], queryFn: getProgramme });
  console.log("programme: ", programme);

  return (
    <div className="m-lg-4 m-2">
      <Heading>Programmes</Heading>
      <DividerCmp className="my-3" />
      <FlatList
        className="grid-5"
        data={programme?.rows}
        renderItem={(prog) => {
          return (
            <Card hoverable cover={<img style={{ height: 200, width: "100%", objectFit: "cover" }} src={prog?.image} />}>
              <Heading>{prog?.name}</Heading>
              <Para>{prog?.description}</Para>
            </Card>
          );
        }}
      />
    </div>
  );
}
