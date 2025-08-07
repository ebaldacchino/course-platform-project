import { db } from "@/drizzle/db";
import {
  CourseSectionTable,
  CourseTable,
  LessonTable,
  UserCourseAccessTable,
} from "@/drizzle/schema";
import { getUserCourseAccessUserTag } from "@/features/courses/userCourseAccess.cache";
import { wherePublicCourseSections } from "@/features/courseSections/sections.permissions";
import { and, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { getLessonIdTag } from "./lessons.cache";
import { wherePublicLessons } from "./lessons.permissions";

export async function canUpdateUserLessonCompleteStatus(
  user: { userId: string | undefined },
  lessonId: string
) {
  "use cache";
  cacheTag(getLessonIdTag(lessonId));

  if (!user.userId) return false;

  cacheTag(getUserCourseAccessUserTag(user.userId));

  const [courseAccess] = await db
    .select({ courseId: CourseTable.id })
    .from(UserCourseAccessTable)
    .innerJoin(CourseTable, eq(CourseTable.id, UserCourseAccessTable.courseId))
    .innerJoin(
      CourseSectionTable,
      and(
        eq(CourseSectionTable.courseId, CourseTable.id),
        wherePublicCourseSections
      )
    )
    .innerJoin(
      LessonTable,
      and(eq(LessonTable.sectionId, CourseSectionTable.id), wherePublicLessons)
    )
    .where(
      and(
        eq(LessonTable.id, lessonId),
        eq(UserCourseAccessTable.userId, user.userId)
      )
    )
    .limit(1);

  return !!courseAccess;
}
