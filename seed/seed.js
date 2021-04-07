/**
 * Fake data seeds.
 * @package moyklass-api-example
 * @version 2021-04-06
 */
const faker = require('faker')
    , Path = require('path')
    , DI = require(Path.join(Path.dirname(__dirname), 'src', 'di.js'))
    , { RelLessonTeachers, RelLessonStudents } = require(Path.join(Path.dirname(__dirname), 'src', 'models'))

const randomInc = (low, high) => {
  return Math.floor(Math.random() * (high - low) + low)
}

;(async () => {
  // Sync.
  await DI.getSequelize().sync({ force: true })

  // Lessons.
  const lessons = [...Array(30)].map(() => (
    {
      title: faker.vehicle.manufacturer(),
      start_at: faker.date.soon(),
      status: faker.datatype.boolean() ? 1 : 0,
      teachers: [...Array(randomInc(1, 3))].map(() => (
        {
          name: faker.name.findName()
        }
      )),
      students: [...Array(randomInc(3, 13))].map(() => (
        {
          name: faker.name.findName(),
          lessons_students: {
            visit: faker.datatype.boolean()
          }
        }
      ))
    }
  ))

  DI.getSequelize().models.lesson.bulkCreate(lessons, {
    include: [
      { association: RelLessonTeachers },
      { association: RelLessonStudents }
    ]
  })
})()
.catch(err => {
  console.trace(err)
  process.exit(1)
})
