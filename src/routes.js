'use strict'
/**
 * Router rules for app.
 * @version 2021-04-07
 */
const Config = require('config')
    , Qs = require('qs')
    , { Op } = require("sequelize")
    , Router = require('koa-router')
    , { DateTime } = require('luxon')
    , DI = require('./di.js')
    , { Lesson, Teacher, Student, LessonTeachers } = require('./models')

// Init router.
const router = new Router({ prefix: Config.server.router.prefix || '' })

// Init routes.
router
    //
    .get('get', '/ver', (ctx, next) => {
      ctx.status = 200
      ctx.body = Config.app.version
      return next()
    })
    //
    .get('get', '/', async (ctx, next) => {
      ctx.status = 200

      let page = 1,
          per_page = 5,
          lessons_criteria = {},
          subquery_criteria = {},
          teacher_criteria = {
            model: Teacher,
            attributes: ['id', 'name']
          }

      // Filter processing.
      const query = Qs.parse(ctx.query)

      // lessonsPerPage
      if (-1 !== Object.keys(query).indexOf('lessonsPerPage') && !isNaN(query.lessonsPerPage)) {
        per_page = parseInt(query.lessonsPerPage)
      }

      // page
      if (-1 !== Object.keys(query).indexOf('page') && !isNaN(query.page)) {
        page = 0 < parseInt(query.page) ? parseInt(query.page) : 1
      }

      // studentsCount
      if (-1 !== Object.keys(query).indexOf('studentsCount')) {

        // Probably got range of count of students.
        if (isNaN(query.studentsCount)) {
          query.studentsCount = query.studentsCount.split(',')

          // Filter non number values.
          query.studentsCount = query.studentsCount.filter(v => !isNaN(v))

          // Build criteria.
          if (2 === query.studentsCount.length) {
            subquery_criteria = { op: Op.between, value: query.studentsCount }
          }
        }
        else {
          // Build criteria.
          if (parseInt(query.studentsCount)) {
            subquery_criteria = { op: Op.eq, value: parseInt(query.studentsCount) }
          }
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

      // Calc offset.
      let offset = (page * per_page) - per_page

      console.log('page=', page)
      console.log('per_page=', per_page)
      console.log('(page * per_page)=', (page * per_page))

      // Init subquery value for catch count of visited lessons.
      const sqlVisitCount = '(SELECT COUNT(*) FROM "lessons_students" WHERE "lessons_students"."lessonId" = "lesson"."id" AND "lessons_students"."visit" = true)'

      // Build common criteria.
      let criteria = {
        attributes: [
          'id', 'title', 'start_at', 'status', [
            DI.getSequelize().literal(sqlVisitCount), 'visitCount'
          ]
        ],
        order: [
          ['id', 'DESC']
        ],
        include: [
          teacher_criteria,
          Student
        ],
        limit: per_page,
        offset: offset
      }

      // Build lessons criteria.
      if (Object.keys(lessons_criteria).length) {
        criteria['where'] = lessons_criteria
      }

      // Build sub query criteria.
      if (Object.keys(subquery_criteria).length) {
        criteria['group'] = ['lesson.id']
        criteria['having'] = DI.getSequelize().where(DI.getSequelize().literal(sqlVisitCount), subquery_criteria.op, subquery_criteria.value)
      }

      // Entry log about criteries.
      DI.getLog('trace').error(`Find all by criterias: ${JSON.stringify(criteria)}`)

      // Fetch data by request.
      let response = await Lesson.findAll(criteria)

      // Entry log about found items.
      DI.getLog('trace').error(`Found ${response.length} items`)

      // Prepare response.
      ctx.body = response.map(i => {
        i = i.toJSON()
        i.students = i.students.map(s => { s.visit = s.lessons_students.visit; delete s.lessons_students; return s; })
        i.teachers = i.teachers.map(t => { delete t.lesson_teachers; return t; })
        return i
      })

      await next()
    })
    //
    .post('post', '/lessons', async (ctx, next) => {
      //
      if ('[object Object]' !== Object.prototype.toString.call(ctx.request.body)) {
        try {
          ctx.request.body = JSON.parse(ctx.request.body)
        }
        catch (e) {
          throw new Error(`An error occured while parse request: ${e}`)
        }
      }

      // Init list of keys of body.
      const req_keys = Object.keys(ctx.request.body)

      // Entry log about keys in request.
      DI.getLog('trace').error(`Recieved JSON with keys ${req_keys.join(', ')}`)

      // Checking if require keys are exists in list of keys.
      Array('title', 'teacherIds', 'days', 'firstDate').map(key => {
        if (-1 === req_keys.indexOf(key)) {
          throw new Error(`Required key "${key} not found`)
        }
      })

      // Checking if keys lessonsCount or lastDate are exists too in list of keys.
      if (-1 === req_keys.indexOf('lessonsCount') && -1 === req_keys.indexOf('lastDate')) {
        throw new Error('Required keys "lessonsCount" or "lastDate" not found')
      }

      // teacherIds
      let rc_teachers_ids = (Array.isArray(ctx.request.body['teacherIds']) ? [...new Set(ctx.request.body['teacherIds'])] : [ctx.request.body['teacherIds']])

      // Fetch teachers by ids.
      const teachers_list = await Teacher.findAll({ where: { id: rc_teachers_ids }})

      // Compare length of lists by user and fetched data.
      if (rc_teachers_ids.length !== teachers_list.length) {
        // Found unknown ids.
        const unknown_ids = rc_teachers_ids.filter(i => !teachers_list.filter(l => l.id === i ).length)

        // Throw error if unknown ids has been found.
        if (unknown_ids.length) {
          throw new Error(`Teachers with IDs ${unknown_ids.join(', ')} were not found`)
        }
      }

      // days
      let rc_days = (Array.isArray(ctx.request.body['days']) ? ctx.request.body['days'] : [ctx.request.body['days']])
      rc_days = rc_days.map(v => {
        if (v < 0 || 6 < v) {
          throw new Error(`Illegal value for days (0-6 only)`)
        }

        // To @luxon format of weekdays
        if (0 === v) { v = 7 }

        return v
      })

      // Init first date.
      const start_date = DateTime.fromSQL(ctx.request.body['firstDate'])

      // Check if start date is valid.
      if (!start_date.isValid) {
        throw new Error(`Start date is invalid`)
      }

      // Check if start date matched with list of days.
      if (!rc_days.includes(start_date.weekday)) {
        throw new Error(`Start date not matched with days list`)
      }

      let lessons = []

      // Key lastDate processing.
      if (-1 !== req_keys.indexOf('lastDate')) {
        const end_date = DateTime.fromSQL(ctx.request.body['lastDate'])

        // Check if end date is valid.
        if (!end_date.isValid) {
          throw new Error(`End date is invalid`)
        }

        // Check if end date matched with list of days.
        if (!rc_days.includes(end_date.weekday)) {
          throw new Error(`End date not matched with days list`)
        }

        // Check if end date less than start date
        if (end_date <= start_date) {
          throw new Error(`End date less than start date`)
        }

        let next_date = start_date
        while(next_date < end_date) {
          next_date = next_date.plus({ days: 1 })

          if (!rc_days.includes(next_date.weekday)) {
            continue
          }

          lessons.push({
            title: ctx.request.body['title'],
            start_at: start_date.toJSDate(),
            status: 0
          })
        }
      }
      else if (-1 !== req_keys.indexOf('lessonsCount')) {

        let next_date = start_date
        while(lessons.length < ctx.request.body['lessonsCount']) {
          next_date = next_date.plus({ days: 1 })

          if (!rc_days.includes(next_date.weekday)) {
            continue
          }

          lessons.push({
            title: ctx.request.body['title'],
            start_at: start_date.toJSDate(),
            status: 0
          })
        }
      }

      try {
        // Creates lessons.
        const result = await DI.getSequelize().transaction(async t => {
          // Bulk create lessons.
          return DI.getSequelize().models.lesson.bulkCreate(lessons, { returning: true, transaction: t })
                                  .then(items => {
                                    return [
                                      // IDs of lessons.
                                      items.map(l => l.id),
                                      // Build list of teachers.
                                      items.reduce((r, l) => {
                                        r = r.concat(...teachers_list.map(t => { return { teacherId: t.id, lessonId: l.id } }))
                                        return r
                                      }, [])
                                    ]
                                  })
                                  .then(([ids, teachers]) => {
                                    // Attach teachers.
                                    LessonTeachers.bulkCreate(teachers, { transaction: t })

                                    // IDs of lessons.
                                    return ids
                                  })
                                  .catch(function(err) {
                                    DI.getLog('error').error(`An error occured while add lessons: ${err}`)
                                    return Promise.resolve()
                                  })
        })

        // Sets the result.
        ctx.status = 200
        ctx.body = result
      }
      catch(error) {
        console.trace(error)
      }

      await next()
    })

// Exports.
module.exports = {
  routes() { return router.routes() },
  allowedMethods() { return router.allowedMethods() }
}
