import { Tag, Timeline } from "antd";
import useTracker from "./useTracker";
import { SubHeading } from "src/components/styled";

export default function BusRouteTracking({ session_id }) {
  const { items } = useTracker({ session_id });

  return (
    <>
      <Tag className="mb-3 " color="volcano-inverse">
        Boarding Points
      </Tag>
      <Timeline items={items} />
    </>
  );
}
