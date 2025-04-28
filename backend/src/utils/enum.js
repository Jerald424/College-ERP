const enum_values = {
    'gender': [
        { id: 'male', value: 'Male' },
        { id: 'female', value: 'Female' },
        { id: 'other', value: 'Other' },
    ],
    'programme_level': [
        { id: 'ug', value: "UG" },
        { id: 'pg', value: "PG" },
    ],
    'applicant_status': [
        { id: "draft", value: "Draft" },
        { id: "submit", value: "Submit" },
        { id: "selected", value: "Selected" },
        { id: "student_created", value: "Student Created" },
        { id: "rejected", value: "Rejected" },
    ],
    'role_level': [
        { id: "college", value: "College" },
        { id: "staff", value: "Staff" },
        { id: "student", value: "Student" },
    ],
    'student_campus_year_status': [
        { id: "in_progress", value: "In Progress" },
        { id: "completed", value: "Completed" },
        { id: "discontinued", value: "Discontinued" },
    ],
    'class_year': [
        { id: '1', value: "1" },
        { id: '2', value: "2" },
        { id: '3', value: "3" },
    ],
    'audit_operation': [
        { id: 'create', value: "Create" },
        { id: 'edit', value: "Edit" },
        { id: 'delete', value: "Delete" },
    ],
    'hour_type': [
        { id: "schedule", value: "Schedule" },
        { id: "break", value: "Break" },
    ],
    'timetable_day': [
        { id: "Mon", value: "Monday" },
        { id: "Tue", value: "Tuesday" },
        { id: "Wed", value: "Wednesday" },
        { id: "Thu", value: "Thursday" },
        { id: "Fri", value: "Friday" },
        { id: "Sat", value: "Saturday" },
        { id: "Sun", value: "Sunday" },
    ],
    'schedule_status': [
        { id: "not_marked", value: "Not marked" },
        { id: "marked", value: "Marked" },
    ],
    'schedule_student_status': [
        { id: 'present', value: "Present" },
        { id: 'absent', value: "Absent" },
    ],
    'staff_status': [
        { id: 'active', value: "Active" },
        { id: 'in_active', value: "In active" },
    ],
    'staff_leave_type': [
        { id: "paid", value: "Paid" },
        { id: "un_paid", value: "Un Paid" }
    ],
    'staff_leave_days_for': [
        { id: 'month', value: "Month" },
        { id: 'year', value: "Year" },
    ],
    'staff_leave_session': [
        { id: 'forenoon', value: "Forenoon" },
        { id: 'afternoon', value: "Afternoon" },
    ],
    'staff_leave_status': [
        { id: "draft", value: "Draft" },
        { id: "applied", value: "Applied" },
        { id: "approved", value: "Approved" },
        { id: "rejected", value: "Rejected" },
    ],
    'staff_profile_role': [
        { id: "staff", value: "Staff" },
        { id: "hod", value: "HOD" },
        { id: "principal", value: "Principal" },
    ],
    "domain_source": [
        { id: "frontend", value: "Frontend" },
        { id: "backend", value: "Backend" },
    ],
    'exam_type': [
        { id: "internal", value: "Internal" },
        { id: "external", value: "External" },
    ],
    'feedback_question_type': [
        { id: "text", value: "Text" },
        { id: "text-area", value: "Textarea" },
        { id: "dropdown-single", value: "Dropdown Single" },
        { id: "dropdown-multiple", value: "Dropdown Multiple" },
    ],
    'feedback_form_for': [
        { id: "student", value: "Student" },
        { id: "staff", value: "Staff" },
    ],
    'feedback_form_level': [
        { id: 'college', value: "College" },
        { id: 'department', value: "Department" }
    ],
    'bus_schedules_type': [
        { id: "arrive", value: "Arrive" },
        { id: "depart", value: "Depart" },
    ],
    'transport_attendance_status': [
        { id: 'present', value: "Present" },
        { id: 'absent', value: "Absent" }
    ]
};

module.exports = { enum_values };