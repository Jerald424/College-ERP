const router = require('express').Router();
const { returnValue, applyPagination, selectionFormat } = require('../../../functions/handleData');
const sequelize = require('../../../sequelize');
const { ExamMarkEntry } = require('../model/examMarkEntry');

router.post('/timetable/mark-entry', async (req, res) => {
    const transaction = await sequelize.transaction();
    try {

        /* 
            {
                mark_entry:{
                    exam_timetable_id:number;
                    marks:[
                        {student_id:number, mark:number, id:number}
                    ]
                }
            }
        */

        let response = [];
        const { mark_entry } = req.body;
        if (!mark_entry?.exam_timetable_id) return returnValue({ res, status: 400, error: "'exam_timetable_id' not found" });
        let payload = [];
        for (let mark of mark_entry?.marks) {
            if (mark?.id) {
                let [_, updated_mark] = await ExamMarkEntry.update({ mark: mark?.mark }, {
                    transaction,
                    where: {
                        id: mark?.id
                    },
                    returning: true
                });
                response?.push(updated_mark?.[0]);
            }
            else payload?.push({ student_id: mark?.student_id, mark: mark?.mark || 0, exam_timetable_id: mark_entry?.exam_timetable_id })
        };

        let created_mark = await ExamMarkEntry.bulkCreate(payload, { transaction, returning: true });
        response?.push(...created_mark);
        await transaction.commit()
        returnValue({ res, response })
    } catch (error) {
        await transaction.rollback();
        returnValue({ res, error, status: 500 })
    }
});

router.get('/timetable/marks/:exam_timetable_id', async (req, res) => {
    try {
        const { exam_timetable_id } = req.params;
        const marks = await ExamMarkEntry.findAll({
            where: { exam_timetable_id },
            attributes: { exclude: ['cratedAt', 'updatedAt',] }
        });
        returnValue({ res, response: { marks } })
    } catch (error) {
        returnValue({ res, error, status: 500 })
    }
})

module.exports = router;