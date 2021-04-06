'use strict'
/**
 * Router rules for app.
 * @version 2021-04-04
 */
const Config = require('config')
    , Qs = require('qs')
    , { Op } = require("sequelize")
    , Router = require('koa-router')
    , Convert = require('koa-convert')
    , KoaBody = require('koa-body')
    , DI = require('./di.js')
    , { Lesson, Teacher, Student } = require('./models')

// Init router.
const router = new Router({ prefix: Config.server.router.prefix || '' }),
      koaBody = Convert(KoaBody())

router
    //
    .get('get', '/ver', async (ctx) => {
      ctx.status = 200
      ctx.body = Config.app.version
    })
    //
    .get('get', '/', async (ctx) => {
      ctx.status = 200

      let page = 1,
          per_page = 5,
          lessons_criteria = {},
          subquery_criteria = null,
          teacher_criteria = {
            model: Teacher,
            attributes: ['id', 'name']
          }

      // Init subquery value for catch count of visited lessons.
      const sqlVisitCount = '(SELECT COUNT(*) FROM "lessons_students" WHERE "lessons_students"."lessonId" = "lesson"."id" AND "lessons_students"."visit" = true)'

      // Build common criteria.
      let criteria = {
        attributes: [
          'id', 'title', 'start_at', [
            DI.getSequelize().literal(sqlVisitCount), 'visitCount'
          ]
        ],
        order: [
          ['id', 'DESC']
        ]
      }


      // Filter processing.
      const query = Qs.parse(ctx.query)
      console.log('query=', query)

      // Checking if allowed filter keys has been exists in query string.
      if (Object.keys(query).includes('date', 'status', 'teacherIds', 'studentsCount', 'page', 'lessonsPerPage')) {
        // lessonsPerPage
        if (-1 !== Object.keys(query).indexOf('lessonsPerPage') && !isNaN(query.lessonsPerPage)) {
          per_page = parseInt(query.lessonsPerPage)
        }

        // page
        if (-1 !== Object.keys(query).indexOf('page') && !isNaN(query.page)) {
          page = parseInt(query.page)
        }

        // studentsCount
        if (-1 !== Object.keys(query).indexOf('studentsCount')) {
          // Probably got range of count of students.
          if (isNaN(query.studentsCount)) {
            query.studentsCount = query.studentsCount.split(',')
          }

          // Convert to array if is not an array.
          if (!Array.isArray(query.studentsCount)) {
            query.studentsCount = [query.studentsCount]
          }

          // Filter non number values.
          query.studentsCount = query.studentsCount.filter(v => !isNaN(v))

          // Build criteria.
          if (query.studentsCount.length) {
            subquery_criteria = query.studentsCount
          }
        }

        // teacherIds
        if (-1 !== Object.keys(query).indexOf('teacherIds')) {
          // Probably got list of teachers.
          if (isNaN(query.teacherIds)) {
            query.teacherIds = query.teacherIds.split(',')
          }

          // Convert to array if is not an array.
          if (!Array.isArray(query.teacherIds)) {
            query.teacherIds = [query.teacherIds]
          }

          // Filter non number values.
          query.teacherIds = query.teacherIds.filter(v => !isNaN(v))

          // Build criteria.
          if (query.teacherIds.length) {
            teacher_criteria['where'] = { id: query.teacherIds }
          }
        }

        // status
        if (-1 !== Object.keys(query).indexOf('status') && !isNaN(query.status)) {
          lessons_criteria['status'] = query.status
        }

        // date
        if (-1 !== Object.keys(query).indexOf('date')) {
          // Probably got list of dates.
          if (!/^\d{4}-\d{1,2}-\d{1,2}$/.test(query.date)) {
            query.date = query.date.split(',')
          }

          // Convert to array if is not an array.
          if (!Array.isArray(query.date)) {
            query.date = [query.date]
          }

          // Filter non date values.
          query.date = query.date.filter(v => /^\d{4}-\d{1,2}-\d{1,2}$/.test(v))

          // Build criteria.
          if (query.date.length) {
            lessons_criteria['start_at'] = query.date
          }
        }
      }

      let offset = (page * per_page) - per_page

      // Build common criteria.
      criteria = {
        ...criteria,
        ...{
          include: [ teacher_criteria , {
            model: Student,
            attributes: [ 'id', 'name' ],
          } ],
        limit: per_page,
        offset: offset
        }
      }

      if (Object.keys(lessons_criteria).length) {
        criteria['where'] = lessons_criteria
      }

      if (subquery_criteria) {
        criteria['group'] = ['lesson.id']
        criteria['having'] = DI.getSequelize().where(DI.getSequelize().literal(sqlVisitCount), Op.eq, 1)
      }

      // Fetch data by request.
      let response = await Lesson.findAndCountAll(criteria)
      //ctx.body = response

      // Prepare response.
      ctx.body = response.rows.map(i => {
        i = i.toJSON()
        i.students = i.students.map(s => { s.visit = s.lessons_students.visit; delete s.lessons_students; return s; })
        i.teachers = i.teachers.map(t => { delete t.lesson_teachers; return t; })
        return i
      })
    })
    //
    .post('post', '/lessons', koaBody, async (ctx, next) => {
      ctx.status = 200;
      //ctx.body = await graph.add(ctx, ctx.request.body)
    })

// Exports.
module.exports = {
  routes() { return router.routes() },
  allowedMethods() { return router.allowedMethods() }
}
