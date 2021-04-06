# psql -a -d postgres -U postgres -h localhost
# # \i psql_init.sql
# ALTER USER postgres PASSWORD 'myPassword';

CREATE DATABASE "moyklass-api-example"
WITH OWNER "postgres"
ENCODING 'UTF8'
LC_COLLATE = 'en_US.UTF-8'
LC_CTYPE = 'en_US.UTF-8'
TEMPLATE template0;

USE "moyklass-api-example";

CREATE TABLE "lessons" (
	"id" serial NOT NULL,
	"start_at" date NOT NULL,
	"title" text NOT NULL,
	"status" smallint NOT NULL DEFAULT '0',
	CONSTRAINT "lessons_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);

CREATE TABLE "teachers" (
	"id" serial NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "teachers_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);

CREATE TABLE "students" (
	"id" serial NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "students_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);

CREATE TABLE "lesson_teachers" (
	"lesson_id" bigint NOT NULL,
	"teacher_id" bigint NOT NULL,
	CONSTRAINT "lesson_teachers_pk" PRIMARY KEY ("lesson_id","teacher_id")
) WITH (
  OIDS=FALSE
);

CREATE TABLE "lessons_students" (
	"lesson_id" bigint NOT NULL,
	"student_id" bigint NOT NULL,
	"visit" smallint NOT NULL,
	CONSTRAINT "lessons_students_pk" PRIMARY KEY ("lesson_id","student_id")
) WITH (
  OIDS=FALSE
);

ALTER TABLE "lesson_teachers" ADD CONSTRAINT "lesson_teachers_fk0" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE;
ALTER TABLE "lesson_teachers" ADD CONSTRAINT "lesson_teachers_fk1" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE;

ALTER TABLE "lessons_students" ADD CONSTRAINT "lessons_students_fk0" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE;
ALTER TABLE "lessons_students" ADD CONSTRAINT "lessons_students_fk1" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE;
