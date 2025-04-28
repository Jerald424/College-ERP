const { AdmissionApplicant } = require("../model/admissionApplicant");
const ApplicantFee = require("../model/applicantFee");
const ApplicationFee = require("../model/applicationFee");
const { Programme } = require("../model/programme");
const { createAudit } = require('../../base/functions/createAuditLog')

AdmissionApplicant.afterCreate('create_audit', (instance, options) => createAudit({ instance, options, operation: 'create', model: AdmissionApplicant }),);
AdmissionApplicant.beforeUpdate('update_audit', (instance, options) => createAudit({ instance, options, operation: 'edit', model: AdmissionApplicant }),);
AdmissionApplicant.beforeDestroy('update_audit', (instance, options) => createAudit({ instance, options, operation: 'delete', model: AdmissionApplicant }),);

ApplicantFee.afterCreate('applicant_fee_create_audit', (instance, options) => createAudit({ instance, options, operation: 'create', model: ApplicantFee }),);
ApplicantFee.beforeUpdate('applicant_fee_update_audit', (instance, options) => createAudit({ instance, options, operation: 'edit', model: ApplicantFee }),);

ApplicationFee.afterCreate('application_fee_create_audit', (instance, options) => createAudit({ instance, options, operation: 'create', model: ApplicantFee }),);
ApplicationFee.beforeUpdate('application_fee_update_audit', (instance, options) => createAudit({ instance, options, operation: 'edit', model: ApplicantFee }),);
ApplicationFee.beforeDestroy('application_fee_update_audit', (instance, options) => createAudit({ instance, options, operation: 'delete', model: ApplicantFee }),);

Programme.afterCreate('programme_create_audit', (instance, options) => createAudit({ instance, options, operation: 'create', model: Programme }),);
Programme.beforeUpdate('programme_update_audit', (instance, options) => createAudit({ instance, options, operation: 'edit', model: Programme }),);
Programme.beforeDestroy('programme_update_audit', (instance, options) => createAudit({ instance, options, operation: 'delete', model: Programme }),);


