'use strict'
/**
 * @package moyklass-api-example
 * @version 2021-04-06
 */
const
    DataTypes = require('sequelize/lib/data-types')
    , DI = require('../di.js')
    , Teacher = require('./teacher')
    , Student = require('./student')
    , Lesson = require('./lesson')


//
// Pivot relationships.
//
const LessonTeachers = DI.getSequelize().define('lesson_teachers', {
  teacherId: { type: DataTypes.INTEGER, primaryKey: true },
  lessonId: { type: DataTypes.INTEGER, primaryKey: true },
}, { timestamps: false })


LessonTeachers.associate = function(models) {
  LessonTeachers.belongsTo(models.Teacher, {
    foreignKey: 'teacherId',
    onDelete: 'CASCADE'
  })

  LessonTeachers.belongsTo(models.Lesson, {
    foreignKey: 'lessonId',
    onDelete: 'CASCADE'
  })
}

const LessonStudents = DI.getSequelize().define('lessons_students', {
  studentId: { type: DataTypes.INTEGER, primaryKey: true },
  lessonId: { type: DataTypes.INTEGER, primaryKey: true },
  visit: { type: DataTypes.BOOLEAN, allowNull: false, default: false }
}, { timestamps: false })

LessonStudents.associate = function(models) {
  LessonStudents.belongsTo(models.Student, {
    foreignKey: 'studentId',
    onDelete: 'CASCADE'
  })

  LessonStudents.belongsTo(models.Lesson, {
    foreignKey: 'lessonId',
    onDelete: 'CASCADE'
  })
}

Lesson.belongsToMany(Student, { through: LessonStudents })
Student.belongsToMany(Lesson, { through: LessonStudents })

Lesson.belongsToMany(Teacher, { through: LessonTeachers })
Teacher.belongsToMany(Lesson, { through: LessonTeachers })

// Export
module.exports = {
  Teacher,
  Student,
  Lesson
}
