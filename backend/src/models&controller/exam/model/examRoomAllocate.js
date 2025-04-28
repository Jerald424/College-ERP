const { DataTypes, ValidationError } = require("sequelize");
const sequelize = require("../../../sequelize");
const { ExamTimetable } = require("./examTimetable");
const Student = require('../../student/model/student');

const ExamRoomAllocate = sequelize.define('exam_room_allocate', {
    row: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    column: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
}, {
    tableName: 'exam_room_allocate',

})

ExamTimetable.hasMany(ExamRoomAllocate, {
    foreignKey: "exam_timetable_id",
    as: "exam_room_allocate"
});
ExamRoomAllocate.belongsTo(ExamTimetable, {
    foreignKey: "exam_timetable_id",
    as: 'exam_timetable'
});

Student.hasMany(ExamRoomAllocate, {
    foreignKey: "student_id",
    as: "exam_room_allocate"
});
ExamRoomAllocate.belongsTo(Student, {
    foreignKey: "student_id",
    as: "student"
});

const checkRoomAvailable = async (instances) => {
    try {
        for (let instance of instances) {

            let exam_timetable = await ExamTimetable.findByPk(instance?.exam_timetable_id);
            console.log('exam_timetable: ', exam_timetable.date);
            let exist = await ExamRoomAllocate.findOne({
                where: {
                    row: instance?.row,
                    column: instance?.column
                },
                include: [
                    {
                        model: ExamTimetable,
                        as: "exam_timetable",
                        required: true,
                        where: {
                            date: exam_timetable?.dataValues?.date,
                            exam_room_id: exam_timetable?.exam_room_id,
                            exam_room_id: exam_timetable?.exam_room_id

                        }
                    }
                ]
            })
            if (exist) throw new ValidationError(`Your selected place in this room is already occupied`);

        }
    } catch (error) {
        throw new Error(error)
    }
}

ExamRoomAllocate.beforeBulkCreate('check_room_available', checkRoomAvailable)

module.exports = { ExamRoomAllocate };