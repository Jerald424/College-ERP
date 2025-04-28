const { Course, CourseTerm, CourseProgramme, CourseStaff } = require("../model/course");
const { createAudit, } = require('../../base/functions/createAuditLog');
const { TimeTable, TimeTableStaff, TimeTableClass } = require("../model/timetable");

Course.afterCreate('course_create_audit', (instance, options) => createAudit({ instance, options, operation: 'create', model: Course }),);
Course.beforeUpdate('course_update_audit', (instance, options) => createAudit({ instance, options, operation: 'edit', model: Course }),);
Course.beforeDestroy('course_update_audit', (instance, options) => createAudit({ instance, options, operation: 'delete', model: Course }),);

CourseTerm.afterCreate('term_create_audit', (instance, options) => createAudit({ instance, options, operation: 'create', model: CourseTerm }),);
CourseTerm.beforeUpdate('term_update_audit', (instance, options) => createAudit({ instance, options, operation: 'edit', model: CourseTerm }),);
CourseTerm.beforeDestroy('term_update_audit', (instance, options) => createAudit({ instance, options, operation: 'delete', model: CourseTerm }),);

// CourseProgramme.afterCreate('programme_create_audit', (instance, options) => createAudit({ instance, options, operation: 'create', model: CourseProgramme }),);
// CourseProgramme.beforeUpdate('programme_update_audit', (instance, options) => createAudit({ instance, options, operation: 'edit', model: CourseProgramme }),);
// CourseProgramme.beforeDestroy('programme_update_audit', (instance, options) => createAudit({ instance, options, operation: 'delete', model: CourseProgramme }),);

CourseStaff.afterCreate('staff_create_audit', (instance, options) => createAudit({ instance, options, operation: 'create', model: CourseStaff }),);
CourseStaff.beforeUpdate('staff_update_audit', (instance, options) => createAudit({ instance, options, operation: 'edit', model: CourseStaff }),);

TimeTable.afterCreate('timetable_create_audit', (instance, options) => createAudit({ instance, options, operation: 'create', model: TimeTable }),);
TimeTable.beforeUpdate('timetable_update_audit', (instance, options) => createAudit({ instance, options, operation: 'edit', model: TimeTable }),);
TimeTable.beforeDestroy('timetable_update_audit', (instance, options) => createAudit({ instance, options, operation: 'delete', model: TimeTable }),);

TimeTableStaff.beforeBulkCreate('timetable_staff_bc_audit', (instance, options) => createAudit({ instance, options, operation: 'create', model: TimeTableStaff, creationMode: 'bulkCreate' }))
TimeTableStaff.beforeDestroy('timetable_staff_destroy_audit', (instance, options) => createAudit({ instance, options, operation: 'create', model: TimeTableStaff, }))

TimeTableClass.beforeBulkCreate('timetable_class_bc_audit', (instance, options) => createAudit({ instance, options, operation: 'create', model: TimeTableClass, creationMode: 'bulkCreate' }))
TimeTableClass.beforeDestroy('timetable_class_destroy_audit', (instance, options) => createAudit({ instance, options, operation: 'create', model: TimeTableClass, }))