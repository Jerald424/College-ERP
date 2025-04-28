import withLazy from "src/hoc/withLazy";

const Admission = withLazy(() => import("src/views/admission"));
const Login = withLazy(() => import("src/views/login"));
const ViewDividerIndex = withLazy(() => import("src/views"));
import { MainDivider } from "src/views";
const StaffCommunication = withLazy(() => import("src/views/communication/staff"));
const StaffLeaveEmailApproval = withLazy(() => import("src/views/leave/staff/approvals/email"));

export const un_auth_routes = [
  {
    path: "/admission",
    children: [
      {
        path: "index/*",
        component: Admission,
      },
    ],
  },
];

export const un_login_routes = [
  {
    path: "/",
    children: [
      {
        path: "",
        component: Login,
      },
    ],
  },
];

export const login_routes = [
  {
    path: "/",
    children: [
      {
        path: "",
        component: MainDivider,
      },
      {
        path: "divider/*",
        component: ViewDividerIndex,
      },
    ],
  },
  {
    path: "/leave",
    children: [
      {
        path: "staff-leave-approve/:status/:enc",
        component: StaffLeaveEmailApproval,
      },
    ],
  },
  {
    path: "communication",
    children: [
      {
        path: "chats&group/*",
        component: StaffCommunication,
      },
    ],
  },
];
