const { Op } = require('sequelize');
const { returnValue, applyPagination, checkValuesAreExist } = require('../../../functions/handleData');
const Term = require('../../base/model/academicYear/term');
const { Course, CourseTerm, CourseStaff, CourseClass } = require('../model/course');
const { isEmpty } = require('lodash');
const sequelize = require('../../../sequelize');
const { Programme } = require('../../admission/model/programme');
const { Staff } = require('../../staff/model/staff');
const Class = require('../../department/model/class');

const router = require('express').Router();

router.get('/course', async (req, res) => {
    try {

        let course_attributes = req.query['course_attributes']?.split(',');
        let academic_year_id = req.query['academic_year_id'];

        let ac_where = { academic_year_id }

        let response = await Course.findAndCountAll({
            ...applyPagination({ req }),
            ...course_attributes && { attributes: [...course_attributes, 'createdAt'], },
            include: [
                {
                    model: Term,
                    as: 'terms',
                    // attributes: [],
                    required: true,
                    ...ac_where?.academic_year_id && { where: ac_where }
                }
            ],
        });

        returnValue({ response, res })

    } catch (error) {
        console.log('error: ', error);
        returnValue({ error, res, status: 500 })
    }
});
router.post('/course', async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        /* 
           course:{
               name:<string>,
               code:<string>,
               term_ids:number[],
               programme_ids:number[],
               staff_ids:number[]
           }
       */
        const { course } = req.body;
        const valuesCheck = checkValuesAreExist({ name: course?.name, code: course?.code })
        if (valuesCheck) return returnValue({ res, error: `${valuesCheck} are required`, status: 400 });
        let response = {};
        let course_record = await Course.create({ name: course?.name, code: course?.code }, { returning: true, user_id: req['headers']?.user_id, transaction });
        Object.assign(response, course_record?.dataValues)
        if (!isEmpty(course?.term_ids)) {
            let term = await CourseTerm.bulkCreate?.(course?.term_ids?.map(res => ({ courseId: course_record?.id, termId: res })), { returning: true, record_id: course_record?.id, user_id: req['headers']?.user_id, transaction });
            response['terms'] = term
        }
        // if (!isEmpty(course?.programme_ids)) {
        //     let programme = await CourseProgramme.bulkCreate?.(course?.programme_ids?.map(res => ({ courseId: course_record?.id, programmeId: res })), { returning: true, record_id: course_record?.id, user_id: req['headers']?.user_id, transaction });
        //     response['programmes'] = programme
        // }
        if (!isEmpty(course?.class_ids)) {
            let classes = await CourseClass.bulkCreate?.(course?.class_ids?.map(res => ({ courseId: course_record?.id, classId: res })), { returning: true, record_id: course_record?.id, user_id: req['headers']?.user_id, transaction });
            response['classes'] = classes
        }
        if (!isEmpty(course?.staff_ids)) {
            let staff = await CourseStaff.bulkCreate?.(course?.staff_ids?.map(res => ({ courseId: course_record?.id, staffId: res })), { returning: true, record_id: course_record?.id, user_id: req['headers']?.user_id, transaction });
            response['staffs'] = staff
        }

        await transaction.commit()
        returnValue({ res, response });

    } catch (error) {
        await transaction.rollback()

        returnValue({ error, res, status: 500 })
    }
});

router.put('/course/:course_id', async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        /* 
            course:{
                name:<string>,
                code:<string>,
                term_ids:number[],
                programme_ids:number[],
                staff_ids:number[]
            }
        */
        const { course } = req.body;
        const { course_id } = req.params;
        let response = {
            terms: [],
            programmes: [],
            staffs: []
        };

        let [count, course_record] = await Course.update({ name: course?.name, code: course?.code }, { transaction, where: { id: course_id }, returning: true, individualHooks: true });

        for (let rec of course_record) {
            await rec?.['setTerms']?.([]);
            await CourseClass.destroy({ where: { courseId: rec?.id }, transaction });

            await rec?.['setStaffs']?.([]);
            if (!isEmpty(course?.term_ids)) {
                let terms = await rec?.['addTerms']?.(course?.term_ids, { transaction, returning: true });
                response['terms '] = terms
            }

            if (!isEmpty(course?.class_ids)) {
                let classes = await CourseClass.bulkCreate(course?.class_ids?.map(res => ({ courseId: course_id, classId: res })), { transaction });
                response['classes'] = classes
            }
            if (!isEmpty(course?.staff_ids)) {
                let staffs = await rec?.['addStaffs']?.(course?.staff_ids, { transaction, returning: true });
                response['staffs '] = staffs
            }
        };

        await transaction.commit();
        Object.assign(response, course_record?.[0]?.dataValues)
        returnValue({ res, response })

    } catch (error) {
        console.log('error: ', error);
        await transaction.rollback();
        returnValue({ error, res, status: 500 })
    }
});

router.delete('/course/:ids', async (req, res) => {
    try {
        let { ids } = req.params;
        ids = ids?.split(',').map(Number)
        let response = await Course.destroy({ where: { id: { [Op.in]: ids } } });
        returnValue({ res, response });

    } catch (error) {
        returnValue({ res, error, status: 500 });
    }
});

router.get('/course/support-data', async (req, res) => {
    try {
        let response = {};
        let terms = await Term.findAll({
            attributes: ['id', 'name']
        })
        let classes = await Class.findAll({
            attributes: ['id', 'name']
        })
        let staffs = await Staff.findAll({
            attributes: ['id', 'name']
        });

        response['terms'] = terms;
        response['classes'] = classes;
        response['staffs'] = staffs
        returnValue({ res, response });
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})


router.get('/course/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let term_attributes = req.query['term_attributes']?.split(',');
        let class_attributes = req.query['class_attributes']?.split(',');
        let staff_attributes = req.query['staff_attributes']?.split(',');
        let course_attributes = req.query['course_attributes']?.split(',');

        let response = await Course.findByPk(id, {
            attributes: course_attributes,
            include: [
                {
                    model: Term,
                    attributes: term_attributes,
                    as: "terms"
                },
                {
                    model: Class,
                    attributes: class_attributes,
                    as: "classes"
                },
                {
                    model: Staff,
                    attributes: staff_attributes,
                    as: 'staffs'
                }
            ],
        });

        returnValue({ response, res })
    } catch (error) {
        returnValue({ res, error, status: 500 });
    }
})


module.exports = router;