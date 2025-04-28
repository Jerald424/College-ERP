import { useRef } from "react";
import { Icon, Para } from "src/components/styled";
import { useColors } from "src/redux/hooks";
import { StarFilled } from "@ant-design/icons";

export default function DashboardMarquee() {
  const { colorPrimaryBgHover, colorPrimary } = useColors();
  const marqueeRef = useRef();

  const handleStopMarquee = (mode: "stop" | "start") => {
    try {
      if (mode === "stop") marqueeRef?.current?.stop?.();
      else marqueeRef?.current?.start?.();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="cp" style={{ backgroundColor: colorPrimaryBgHover }} onMouseEnter={() => handleStopMarquee("stop")} onMouseLeave={() => handleStopMarquee("start")}>
      <marquee ref={marqueeRef}>
        <div className="df">
          <Para style={{ color: colorPrimary }} className="fw-bold">
            Education is the passport to the future, for tomorrow belongs to those who prepare for it today
          </Para>{" "}
          <StarFilled className="mx-3" />
          <Para style={{ color: colorPrimary }} className="fw-bold">
            The beautiful thing about learning is that no one can take it away from you
          </Para>{" "}
          <StarFilled className="mx-3" />
          <Para style={{ color: colorPrimary }} className="fw-bold">
            Success is the sum of small efforts, repeated day in and day out{" "}
          </Para>
        </div>
      </marquee>
    </div>
  );
}
