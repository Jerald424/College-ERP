const sequelize = require('../../../sequelize');
const { ComGroup, ComGroupAdmin, ComGroupMembers } = require('../models/group')

module.exports = {

    async createGroup(group) {
        let transaction = await sequelize.transaction()
        try {
            /*
            name | image | description | created_by_id
            admins = [1,2,3];
            members = [1,2,3,4];
            */
            let response = {};
            let c_group = await ComGroup.create(group, { returning: true, transaction });
            Object.assign(response, c_group?.toJSON())

            let admin_payload = group?.admins?.map(res => ({ comGroupId: c_group?.id, userId: res }))
            let c_admins = await ComGroupAdmin.bulkCreate(admin_payload, { transaction, returning: true });
            response['admins'] = c_admins;

            let members_payload = group?.members?.map(res => ({ comGroupId: c_group?.id, userId: res }));
            console.log('members_payload: ', members_payload);
            let c_members = await ComGroupMembers.bulkCreate(members_payload, { transaction, returning: true });
            response['members'] = c_members;
            await transaction.commit();
            return response;
        } catch (error) {
            await transaction.rollback();
            throw new Error(error)
        }
    },
    async updateGroup() {
        try {

        } catch (error) {
            throw new Error(error)
        }
    },
    async deleteGroup() {
        try {

        } catch (error) {
            throw new Error(error)
        }
    },
    async getGroup() {
        try {

        } catch (error) {
            throw new Error(error);
        }
    }
};