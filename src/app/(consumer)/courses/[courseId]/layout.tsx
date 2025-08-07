import { db } from "@/drizzle/db";
import {
  CourseSectionTable,
  CourseTable,
  LessonTable,
  UserLessonCompleteTable,
} from "@/drizzle/schema";
import { getCourseIdTag } from "@/features/courses/courses.cache";
import { getCourseSectionCourseTag } from "@/features/courseSections/sections.cache";
import { wherePublicCourseSections } from "@/features/courseSections/sections.permissions";
import { getLessonCourseTag } from "@/features/lessons/lessons.cache";
import { wherePublicLessons } from "@/features/lessons/lessons.permissions";
import { getUserLessonCompleteUserTag } from "@/features/lessons/userLessonComplete.cache";
import { getCurrentUser } from "@/services/clerk";
import { asc, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { notFound } from "next/navigation";
import { ReactNode, Suspense } from "react";
import { CoursePageClient } from "./_client";

interface CoursePageLayoutProps {
  params: Promise<{ courseId: string }>;
  children: ReactNode;
}

interface Course {
  name: string;
  id: string;
  courseSections: {
    name: string;
    id: string;
    lessons: {
      name: string;
      id: string;
    }[];
  }[];
}

export default async function CoursePageLayout(props: CoursePageLayoutProps) {
  const { courseId } = await props.params;
  const course = await getCourse(courseId);

  if (!course) return notFound();

  return (
    <div className="container grid sm:grid-cols-2 gap-8 mx-auto">
      <div className="py-4">
        <div className="text-lg font-semibold">{course.name}</div>
        <Suspense
          fallback={<CoursePageClient course={mapCourse(course, [])} />}
        >
          <SuspenseBoundary course={course} />
        </Suspense>
      </div>
      <div className="py-4">{props.children}</div>
    </div>
  );
}

async function getCourse(id: string) {
  "use cache";
  cacheTag(
    getCourseIdTag(id),
    getCourseSectionCourseTag(id),
    getLessonCourseTag(id)
  );

  return db.query.CourseTable.findFirst({
    where: eq(CourseTable.id, id),
    columns: { id: true, name: true },
    with: {
      courseSections: {
        orderBy: asc(CourseSectionTable.order),
        where: wherePublicCourseSections,
        columns: { id: true, name: true },
        with: {
          lessons: {
            orderBy: asc(LessonTable.order),
            where: wherePublicLessons,
            columns: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
}

async function SuspenseBoundary({ course }: { course: Course }) {
  const { userId } = await getCurrentUser();
  const completedLessonIds =
    typeof userId !== "string" ? [] : await getCompletedLessonIds(userId);

  return <CoursePageClient course={mapCourse(course, completedLessonIds)} />;
}

async function getCompletedLessonIds(userId: string) {
  "use cache";
  cacheTag(getUserLessonCompleteUserTag(userId));

  const data = await db.query.UserLessonCompleteTable.findMany({
    columns: { lessonId: true },
    where: eq(UserLessonCompleteTable.userId, userId),
  });

  return data.map((d) => d.lessonId);
}

function mapCourse(course: Course, completedLessonIds: string[]) {
  return {
    ...course,
    courseSections: course.courseSections.map((section) => {
      return {
        ...section,
        lessons: section.lessons.map((lesson) => {
          return {
            ...lesson,
            isComplete: completedLessonIds.includes(lesson.id),
          };
        }),
      };
    }),
  };
}
