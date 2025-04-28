import { ProfileFilled, ToolFilled, UserOutlined, CalendarFilled } from "@ant-design/icons";
import { NavLink } from "react-router-dom";
import { Icon } from "src/components/styled";

export const college_level_menu = [
  {
    icon: <ProfileFilled />,
    label: "Admission",
    key: "admission",
    children: [
      {
        label: "Views",
        key: "view_submenu",
        children: [
          {
            key: "applicant",
            label: "Applicant",
          },
        ],
      },
      {
        label: "Config",
        key: "config_submenu",
        children: [
          {
            key: "programme",
            label: "Programme",
          },
          {
            key: "applicant-fee",
            label: "Applicant Fee",
          },
        ],
      },
      {
        label: "Proceed",
        key: "procedure_submenu",
        children: [
          {
            key: "fee",
            label: "Fee",
          },
          {
            key: "select-applicant",
            label: "Select Applicant",
          },
          {
            key: "convert-student",
            label: "Convert Student",
          },
        ],
      },
    ],
  },
  {
    icon: <Icon className="fa-solid fa-book" style={{ fontSize: 13 }} />,
    label: "Department",
    key: "department",
    children: [
      {
        key: "",
        label: "List",
      },
    ],
  },
  {
    icon: <Icon className="fa-solid fa-graduation-cap" style={{ fontSize: 13 }} />,
    label: "Course",
    key: "course",
    children: [
      {
        key: "admin/list",
        label: "List",
      },
    ],
  },
  {
    icon: <Icon className="fa-solid fa-person" />,
    label: "Student",
    key: "student",
    children: [
      {
        key: "",
        label: "List",
      },
    ],
  },
  {
    icon: <ToolFilled />,
    label: "Configuration",
    key: "base",
    children: [
      {
        key: "user_submenu",
        label: "Users",
        children: [
          {
            key: "users",
            label: "Users",
          },
          {
            key: "roles",
            label: "Roles",
          },
        ],
      },
      {
        key: "base_submenu",
        label: "Base",
        children: [
          {
            key: "academic-year",
            label: "Academic Year",
          },
          {
            key: "state",
            label: "State",
          },
          {
            key: "district",
            label: "District",
          },
          {
            key: "institution-profile",
            label: "Institution Profile",
          },
        ],
      },
      {
        key: "communication_submenu",
        label: "Communication",
        children: [
          {
            key: "mail-config",
            label: "Mail",
          },
          {
            key: "domain-url",
            label: "Domain url",
          },
        ],
      },
    ],
  },
  {
    icon: <Icon className="fa-solid fa-calendar" style={{ fontSize: 13 }} />,
    label: "Schedule",
    key: "schedule",
    children: [
      {
        key: "calender",
        label: "Calender",
      },
      {
        key: "timetable",
        label: "Timetable",
      },
      {
        key: "schedules",
        label: "Schedules",
      },
      {
        key: "my-schedule",
        label: "My Schedules",
      },
    ],
  },
  {
    icon: <Icon className="fa-solid fa-user-tie" style={{ fontSize: 13 }} />,
    label: "Staff",
    key: "staff",
    children: [
      {
        key: "list",
        label: "List",
      },
    ],
  },
  {
    icon: <UserOutlined />,
    label: "Profile",
    key: "profile",
    children: [
      {
        label: "My Profile",
        key: "",
      },
    ],
  },
  {
    icon: <Icon className="fa-regular fa-calendar-check" />,
    label: "Leave",
    key: "leave",
    children: [
      {
        label: "Config",
        key: "leave_config_submenu",
        children: [
          {
            label: "Staff Leave",
            key: "leave-config",
          },
        ],
      },
      {
        label: "Views",
        key: "leave_view_submenu",
        children: [
          {
            label: "Leave",
            key: "leave-list",
          },
        ],
      },
      {
        label: "Proceed",
        key: "leave_proceed_submenu",
        children: [
          {
            label: "Staff Leave Approval",
            key: "staff-leave-approvals",
          },
        ],
      },
    ],
  },
  {
    icon: <Icon className="fa-solid fa-clipboard-check" />,
    label: "Exam",
    key: "exam",
    children: [
      {
        label: "Config",
        key: "exam_config_submenu",
        children: [
          {
            label: "Config",
            key: "config",
          },
          {
            label: "Exams",
            key: "exam",
          },
          {
            label: "Rooms",
            key: "exam-room",
          },

          {
            label: "Time",
            key: "exam-time",
          },
        ],
      },
      {
        label: "Proceed",
        key: "exam_proceed_submenu",
        children: [
          {
            label: "Timetable",
            key: "timetables",
          },
          {
            label: "Allocate Room",
            key: "exam-room-allocate",
          },
          {
            label: "Schedules",
            key: "schedules",
          },
        ],
      },
    ],
  },
  {
    icon: <Icon className="fa-solid fa-tower-broadcast" style={{ fontSize: 13 }} />,
    label: "Communication",
    key: "com_no_navigation",
    children: [
      {
        label: <NavLink to={"/communication/chats&group"}> Chat & Group</NavLink>,
        key: "sub_com_no_navigation",
      },
    ],
  },
  {
    icon: <Icon className="fa-solid fa-comments" style={{ fontSize: 13 }} />,
    label: "Feedback",
    key: "feedback",
    children: [
      {
        label: "Questions",
        key: "question",
      },
      {
        label: "Form",
        key: "form",
      },
      {
        label: "My feedback",
        key: "user/feedback-list",
      },
    ],
  },
  {
    icon: <Icon className="fa-solid fa-bus" style={{ fontSize: 13 }} />,
    label: "Transport",
    key: "transport",
    children: [
      {
        label: "Bus",
        key: "bus",
      },
      {
        label: "Session",
        key: "bus/session",
      },
      {
        label: "Schedules",
        key: "bus/schedules",
      },
    ],
  },
];

export const student_level_menu = [
  {
    icon: <UserOutlined />,
    label: "Profile",
    key: "profile",
  },
  {
    icon: <CalendarFilled />,
    label: "Schedule",
    key: "schedule/my-schedule",
  },
  {
    icon: <Icon className="fa-solid fa-clipboard-check" />,
    label: "Exam",
    key: "exam",
    children: [
      {
        label: "Schedules",
        key: "student/schedules",
      },
      {
        label: "Result",
        key: "student/result",
      },
    ],
  },
  {
    icon: <Icon className="fa-solid fa-tower-broadcast" style={{ fontSize: 13 }} />,
    label: "Communication",
    key: "com_no_navigation",
    children: [
      {
        label: <NavLink to={"/communication/chats&group"}> Chat & Group</NavLink>,
        key: "sub_com_no_navigation",
      },
    ],
  },
  {
    icon: <Icon className="fa-solid fa-comments" style={{ fontSize: 13 }} />,
    label: "Feedback",
    key: "feedback",
    children: [
      {
        label: "My Feedback",
        key: "user/feedback-list",
      },
    ],
  },
];

export const staff_level_menu = [
  {
    icon: <UserOutlined />,
    label: "Profile",
    key: "profile",
    children: [
      {
        label: "My Profile",
        key: "",
      },
    ],
  },
  {
    icon: <Icon className="fa-solid fa-calendar" style={{ fontSize: 13 }} />,
    label: "Schedule",
    key: "schedule",
    children: [
      {
        key: "my-schedule",
        label: "My Schedules",
      },
    ],
  },
  {
    icon: <Icon className="fa-regular fa-calendar-check" />,
    label: "Leave",
    key: "leave",
    children: [
      {
        label: "Leave",
        key: "leave-list",
      },
    ],
  },
  {
    icon: <Icon className="fa-solid fa-clipboard-check" />,
    label: "Exam",
    key: "exam",
    children: [
      {
        label: "Schedules",
        key: "schedules",
      },
    ],
  },
  {
    icon: <Icon className="fa-solid fa-tower-broadcast" style={{ fontSize: 13 }} />,
    label: "Communication",
    key: "com_no_navigation",
    children: [
      {
        label: <NavLink to={"/communication/chats&group"}> Chat & Group</NavLink>,
        key: "sub_com_no_navigation",
      },
    ],
  },
  {
    icon: <Icon className="fa-solid fa-comments" style={{ fontSize: 13 }} />,
    label: "Feedback",
    key: "feedback",
    children: [
      {
        label: "My Feedback",
        key: "user/feedback-list",
      },
    ],
  },
  {
    icon: <Icon className="fa-solid fa-bus" style={{ fontSize: 13 }} />,
    label: "Transport",
    key: "transport",
    children: [
      {
        label: "Schedules",
        key: "bus/schedules",
      },
    ],
  },
];
