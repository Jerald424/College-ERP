import { Tooltip } from "antd";
import { HTMLProps } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Icon } from "src/components/styled";
import { useColors } from "src/redux/hooks";

export default function MinSidebar() {
  const location = useLocation();
  let current_pathname = location.pathname;
  const navigate = useNavigate();
  const { colorBgTextHover } = useColors();

  return (
    <div style={{ width: "60px", borderRight: `1px solid ${colorBgTextHover}` }} className="df flex-column  align-items-center h-100 p-2">
      <div className="f1">
        <IconWithRound
          onClick={() => navigate("/communication/chats&group")}
          is_active={current_pathname == "/communication/chats&group"}
          iconProps={{ className: "fa-solid fa-inbox cp" }}
          title="Chat"
        />
        <div className="mt-3">
          <IconWithRound
            onClick={() => navigate("/")}
            // is_active={current_pathname == "/communication/chats&group"}
            iconProps={{ className: "fa-solid fa-home cp" }}
            title="Home"
          />
        </div>
      </div>
      <IconWithRound
        // onClick={() => navigate("/communication/chats&group/settings")}
        is_active={current_pathname == "/communication/chats&group/settings"}
        iconProps={{ className: "fa-solid fa-gear cp" }}
        title="Settings"
      />
    </div>
  );
}

type IconWithRoundProps = HTMLProps<HTMLDivElement> & {
  iconProps?: HTMLProps<HTMLDivElement>;
  is_active?: boolean;
};
const IconWithRound = ({ iconProps, ...props }: IconWithRoundProps) => {
  const { colorPrimaryBgHover } = useColors();
  return (
    <Tooltip mouseEnterDelay={0.5} title={props?.title} placement="right">
      <div className="daj rounded-5" {...props} style={{ ...(props?.is_active && { backgroundColor: colorPrimaryBgHover }), ...props?.style, height: 35, width: 35 }} title="">
        <Icon {...iconProps} style={{ fontSize: 18, ...iconProps?.style }} />
      </div>
    </Tooltip>
  );
};
