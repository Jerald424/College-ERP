import withLazy from "src/hoc/withLazy";
import TransportBusCreateEdit from "src/views/transport/admin/bus/createEdit";
import TransportBusScheduleCreateEdit from "src/views/transport/admin/schedules/createEdit";
import TransportBusScheduledList from "src/views/transport/admin/schedules/list";
import TransportBusSessionCreateEdit from "src/views/transport/admin/session/createEdit";
import TransportBusSessionList from "src/views/transport/admin/session/list";

const FeedbackFormCreateEdit = withLazy(() => import("src/views/feedback/admin/form/createEdit"));
const FeedbackFormReport = withLazy(() => import("src/views/feedback/admin/form/createEdit/report/list"));
const FeedbackQuestionByAnswers = withLazy(() => import("src/views/feedback/admin/form/createEdit/report/questionByAnswers"));
const FeedbackForm = withLazy(() => import("src/views/feedback/admin/form/list"));
const FeedbackQuestionCreateEdit = withLazy(() => import("src/views/feedback/admin/question/createEdit"));
const FeedbackQuestions = withLazy(() => import("src/views/feedback/admin/question/list"));
const UserFeedbackDetailed = withLazy(() => import("src/views/feedback/user/detail"));
const UserFeedbackAnswer = withLazy(() => import("src/views/feedback/user/list"));
const TransportBusList = withLazy(() => import("src/views/transport/admin/bus/list"));

const DomainUrlCreateEdit = withLazy(() => import("src/views/base/domainUrl/createEdit"));
const DomainUrlList = withLazy(() => import("src/views/base/domainUrl/list"));
const ExamCreateEdit = withLazy(() => import("src/views/exam/admin/exam/createEdit"));
const ExamList = withLazy(() => import("src/views/exam/admin/exam/list"));
const ExamConfigCreateEdit = withLazy(() => import("src/views/exam/admin/examConfig/createEdit"));
const ExamConfigList = withLazy(() => import("src/views/exam/admin/examConfig/list"));
const ExamRoomCreateEdit = withLazy(() => import("src/views/exam/admin/examRoom/createEdit"));
const ExamRoomList = withLazy(() => import("src/views/exam/admin/examRoom/list"));
const ExamTimeCreateEdit = withLazy(() => import("src/views/exam/admin/examTime/createEdit"));
const ExamTimeList = withLazy(() => import("src/views/exam/admin/examTime/list"));
const ExamTimetableCreateEdit = withLazy(() => import("src/views/exam/admin/examTimetable/createEdit"));
const ExamTimetableList = withLazy(() => import("src/views/exam/admin/examTimetable/list"));
const AllocateExamRoom = withLazy(() => import("src/views/exam/admin/allocatedRoom"));
const ExamScheduleList = withLazy(() => import("src/views/exam/admin/schedules/list"));
const ExamScheduleDetail = withLazy(() => import("src/views/exam/admin/schedules/createEdit"));
const StudentExamSchedules = withLazy(() => import("src/views/exam/student/schedules/list"));
const StudentExamDetail = withLazy(() => import("src/views/exam/student/schedules/detail"));
const GenerateResult = withLazy(() => import("src/views/exam/admin/result/generate"));
const ExamResultList = withLazy(() => import("src/views/exam/admin/result/list"));
const StudentExamResult = withLazy(() => import("src/views/exam/student/result/list"));

const Users = withLazy(() => import("src/views/base/users/list"));
const UserCreate = withLazy(() => import("src/views/base/users/create"));
const RolesList = withLazy(() => import("src/views/base/roles/list"));
const CreateRole = withLazy(() => import("src/views/base/roles/create"));
const AdminApplicantList = withLazy(() => import("src/views/admission/admin/applicants"));
const AdminApplicantView = withLazy(() => import("src/views/admission/admin/applicants/applicant"));
const AdminProgramme = withLazy(() => import("src/views/admission/admin/programme/list"));
const AdminCreateEditProgramme = withLazy(() => import("src/views/admission/admin/programme/createEdit"));
const AdminApplicantFee = withLazy(() => import("src/views/admission/admin/applicantFee/list"));
const AdminCreateEditApplicantFee = withLazy(() => import("src/views/admission/admin/applicantFee/createEdit"));
const AcademicYear = withLazy(() => import("src/views/base/academicYear/list"));
const AcademicYearCreateEdit = withLazy(() => import("src/views/base/academicYear/createEdit"));
const DistrictList = withLazy(() => import("src/views/base/district/list"));
const StateList = withLazy(() => import("src/views/base/state/list"));
const AdminFee = withLazy(() => import("src/views/admission/admin/fee/list"));
const DistrictCreateEdit = withLazy(() => import("src/views/base/district/createEdit"));
const StateCreateEdit = withLazy(() => import("src/views/base/state/createEdit"));
const AdminApplicationFeeCollect = withLazy(() => import("src/views/admission/admin/fee/createEdit"));
const AdminSelectApplicant = withLazy(() => import("src/views/admission/admin/selectApplicant"));
const ConvertStudent = withLazy(() => import("src/views/admission/admin/convertStudent"));
const DepartmentList = withLazy(() => import("src/views/department/list"));
const DepartmentCreateEdit = withLazy(() => import("src/views/department/createEdit"));
const ProgrammeClass = withLazy(() => import("src/views/admission/admin/programme/class/list"));
const AdminCreateProgrammeClass = withLazy(() => import("src/views/admission/admin/programme/class/createEdit"));
const StudentList = withLazy(() => import("src/views/student/list"));
const StudentDetailed = withLazy(() => import("src/views/student/createEdit"));
const InstitutionProfile = withLazy(() => import("src/views/base/institutionProfile/list"));
const InstitutionProfileCreateEdit = withLazy(() => import("src/views/base/institutionProfile/createEdit"));
const Profile = withLazy(() => import("src/views/profile"));
const Term = withLazy(() => import("src/views/base/academicYear/createEdit/term/list"));
const TermCreateEdit = withLazy(() => import("src/views/base/academicYear/createEdit/term/createEdit"));
const TermHoursCreateEdit = withLazy(() => import("src/views/base/academicYear/createEdit/term/createEdit/hour/createEdit"));
const TermHours = withLazy(() => import("src/views/base/academicYear/createEdit/term/createEdit/hour/list"));
const AdminCourseCreateEdit = withLazy(() => import("src/views/course/college/createEdit"));
const AdminCourseList = withLazy(() => import("src/views/course/college/list"));
const AdminCalender = withLazy(() => import("src/views/schedule/admin/calender"));
const EventCreate = withLazy(() => import("src/views/schedule/admin/calender/eventCreate"));
const CalenderListView = withLazy(() => import("src/views/schedule/admin/calender/list"));
const TimetableView = withLazy(() => import("src/views/schedule/admin/timetable"));
const ScheduleList = withLazy(() => import("src/views/schedule/admin/schedule/list"));
const ScheduleEdit = withLazy(() => import("src/views/schedule/admin/schedule/createEdit"));
const MySchedules = withLazy(() => import("src/views/schedule"));
const StaffList = withLazy(() => import("src/views/staff/list"));
const StaffLeaveConfigList = withLazy(() => import("src/views/leave/admin/config/list"));
const StaffDetailed = withLazy(() => import("src/views/staff/createEdit"));
const Leave = withLazy(() => import("src/views/leave"));
const StaffLeaveConfigCreateEdit = withLazy(() => import("src/views/leave/admin/config/createEdit"));
const MailConfigList = withLazy(() => import("src/views/base/mailConfig/list"));
const MailConfigCreateEdit = withLazy(() => import("src/views/base/mailConfig/createEdit"));
const StaffLeaveCreateEdit = withLazy(() => import("src/views/leave/admin/views/staffLeave/createEdit"));
const StaffLeaveList = withLazy(() => import("src/views/leave/admin/views/staffLeave/list"));
const StaffLeaveApprovalsList = withLazy(() => import("src/views/leave/staff/approvals/list"));

export const user_routes = [
  {
    path: "/admission",
    children: [
      {
        path: "applicant",
        component: AdminApplicantList,
      },
      {
        path: "applicant/:id",
        component: AdminApplicantView,
      },
      {
        path: "programme",
        component: AdminProgramme,
      },
      {
        path: "class/:programme_id",
        component: ProgrammeClass,
      },
      {
        path: "class/:programme_id/detail",
        component: AdminCreateProgrammeClass,
      },
      {
        path: "programme/detail",
        component: AdminCreateEditProgramme,
      },
      {
        path: "applicant-fee",
        component: AdminApplicantFee,
      },
      {
        path: "applicant-fee/detail",
        component: AdminCreateEditApplicantFee,
      },
      {
        path: "fee",
        component: AdminFee,
      },
      {
        path: "fee/collect",
        component: AdminApplicationFeeCollect,
      },
      {
        path: "select-applicant",
        component: AdminSelectApplicant,
      },
      {
        path: "convert-student",
        component: ConvertStudent,
      },
    ],
  },
  {
    path: "/department",
    children: [
      {
        path: "",
        component: DepartmentList,
      },
      {
        path: "detail",
        component: DepartmentCreateEdit,
      },
    ],
  },
  {
    path: "/base",
    children: [
      {
        path: "users",
        component: Users,
      },
      {
        path: "users/create",
        component: UserCreate,
      },
      {
        path: "roles",
        component: RolesList,
      },
      {
        path: "roles/create",
        component: CreateRole,
      },
      {
        path: "academic-year",
        component: AcademicYear,
      },
      {
        path: "academic-year/detail",
        component: AcademicYearCreateEdit,
      },
      {
        path: "academic-year/term",
        component: Term,
      },
      {
        path: "academic-year/term/detail",
        component: TermCreateEdit,
      },
      {
        path: "academic-year/term/hour",
        component: TermHours,
      },
      {
        path: "academic-year/term/hour/detail",
        component: TermHoursCreateEdit,
      },
      {
        path: "state",
        component: StateList,
      },
      {
        path: "state/detail",
        component: StateCreateEdit,
      },
      {
        path: "district",
        component: DistrictList,
      },
      {
        path: "district/detail",
        component: DistrictCreateEdit,
      },
      {
        path: "institution-profile",
        component: InstitutionProfile,
      },
      {
        path: "institution-profile/detail",
        component: InstitutionProfileCreateEdit,
      },
      {
        path: "mail-config",
        component: MailConfigList,
      },
      {
        path: "mail-config/detail",
        component: MailConfigCreateEdit,
      },
      {
        path: "domain-url",
        component: DomainUrlList,
      },
      {
        path: "domain-url/detail",
        component: DomainUrlCreateEdit,
      },
    ],
  },
  {
    path: "student",
    children: [
      {
        path: "",
        component: StudentList,
      },
      {
        path: "detail",
        component: StudentDetailed,
      },
    ],
  },
  {
    path: "profile",
    children: [
      {
        path: "",
        component: Profile,
      },
    ],
  },
  {
    path: "/course",
    children: [
      {
        path: "admin/list",
        component: AdminCourseList,
      },
      {
        path: "admin/list/detail",
        component: AdminCourseCreateEdit,
      },
    ],
  },
  {
    path: "/schedule",
    children: [
      {
        path: "calender",
        component: AdminCalender,
      },
      {
        path: "calender/calender-list",
        component: CalenderListView,
      },
      {
        path: "calender/event-create",
        component: EventCreate,
      },
      {
        path: "timetable",
        component: TimetableView,
      },
      {
        path: "schedules",
        component: ScheduleList,
      },
      {
        path: "schedules/detail/:schedule_id",
        component: ScheduleEdit,
      },
      {
        path: "my-schedule",
        component: MySchedules,
      },
    ],
  },
  {
    path: "/staff",
    children: [
      {
        path: "list",
        component: StaffList,
      },
      {
        path: "list/detail",
        component: StaffDetailed,
      },
    ],
  },
  {
    path: "/leave",
    children: [
      {
        path: "",
        component: Leave,
      },
      {
        path: "leave-config",
        component: StaffLeaveConfigList,
      },
      {
        path: "leave-config/detail",
        component: StaffLeaveConfigCreateEdit,
      },
      {
        path: "leave-list",
        component: StaffLeaveList,
      },
      {
        path: "leave-list/detail",
        component: StaffLeaveCreateEdit,
      },
      {
        path: "staff-leave-approvals",
        component: StaffLeaveApprovalsList,
      },
    ],
  },
  {
    path: "/exam",
    children: [
      {
        path: "config",
        component: ExamConfigList,
      },
      {
        path: "config/detail",
        component: ExamConfigCreateEdit,
      },
      {
        path: "exam",
        component: ExamList,
      },
      {
        path: "exam/detail",
        component: ExamCreateEdit,
      },
      {
        path: "exam-room",
        component: ExamRoomList,
      },
      {
        path: "exam-room/detail",
        component: ExamRoomCreateEdit,
      },
      {
        path: "timetables",
        component: ExamTimetableList,
      },
      {
        path: "timetables/detail",
        component: ExamTimetableCreateEdit,
      },
      {
        path: "exam-time",
        component: ExamTimeList,
      },
      {
        path: "exam-time/detail",
        component: ExamTimeCreateEdit,
      },
      {
        path: "exam-room-allocate",
        component: AllocateExamRoom,
      },
      {
        path: "schedules",
        component: ExamScheduleList,
      },
      {
        path: "schedules/detail/:id",
        component: ExamScheduleDetail,
      },
      {
        path: "student/schedules",
        component: StudentExamSchedules,
      },
      {
        path: "student/schedules/detail/:id",
        component: StudentExamDetail,
      },
      {
        path: "result/:exam_config_id",
        component: ExamResultList,
      },
      {
        path: "generate-result/:exam_config_id",
        component: GenerateResult,
      },
      {
        path: "student/result",
        component: StudentExamResult,
      },
    ],
  },
  {
    path: "feedback",
    children: [
      {
        path: "question",
        component: FeedbackQuestions,
      },
      {
        path: "question/detail",
        component: FeedbackQuestionCreateEdit,
      },
      {
        path: "form",
        component: FeedbackForm,
      },
      {
        path: "form/detail",
        component: FeedbackFormCreateEdit,
      },
      {
        path: "user/feedback-list",
        component: UserFeedbackAnswer,
      },
      {
        path: "user/feedback-list/detail/:id",
        component: UserFeedbackDetailed,
      },
      {
        path: "form/detail/report/:form_id",
        component: FeedbackFormReport,
      },
      {
        path: "form/detail/question/:form_id/:question_id",
        component: FeedbackQuestionByAnswers,
      },
    ],
  },
  {
    path: "/transport",
    children: [
      {
        path: "bus",
        component: TransportBusList,
      },
      {
        path: "bus/detail",
        component: TransportBusCreateEdit,
      },
      {
        path: "bus/session",
        component: TransportBusSessionList,
      },
      {
        path: "bus/session/detail",
        component: TransportBusSessionCreateEdit,
      },
      {
        path: "bus/schedules",
        component: TransportBusScheduledList,
      },
      {
        path: "bus/schedules/detail",
        component: TransportBusScheduleCreateEdit,
      },
    ],
  },
];
