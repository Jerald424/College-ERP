const { createAudit, } = require('../../base/functions/createAuditLog');
const { Staff, StaffClass } = require("../model/staff");

Staff.afterCreate('staff_create_audit', (instance, options) => createAudit({ instance, options, operation: 'create', model: Staff }),);
Staff.beforeUpdate('staff_update_audit', (instance, options) => createAudit({ instance, options, operation: 'edit', model: Staff }),);
Staff.beforeDestroy('staff_update_audit', (instance, options) => createAudit({ instance, options, operation: 'delete', model: Staff }),);

StaffClass.beforeBulkCreate('staff_class_create_audit', (instance, options) => createAudit({ instance, options, operation: 'create', model: StaffClass, creationMode: "bulkCreate" }),);
StaffClass.beforeDestroy('staff_class_update_audit', (instance, options) => createAudit({ instance, options, operation: 'delete', model: StaffClass }),);
