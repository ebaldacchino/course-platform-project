import { db } from "@/drizzle/db";
import {
  CourseSectionTable,
  CourseTable,
  type LessonStatus,
  LessonTable,
  UserCourseAccessTable,
  type UserRole,
} from "@/drizzle/schema";
import { getUserCourseAccessUserTag } from "@/features/courses/userCourseAccess.cache";
import { wherePublicCourseSections } from "@/features/courseSections/sections.permissions";
import { getLessonIdTag } from "@/features/lessons/lessons.cache";
import { and, eq, or } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

export function canCreateLessons({ role }: { role: UserRole | undefined }) {
  return role === "admin";
}

export function canUpdateLessons({ role }: { role: UserRole | undefined }) {
  return role === "admin";
}

export function canDeleteLessons({ role }: { role: UserRole | undefined }) {
  return role === "admin";
}

export async function canViewLesson(
  {
    role,
    userId,
  }: {
    userId: string | undefined;
    role: UserRole | undefined;
  },
  lesson: { id: string; status: LessonStatus }
) {
  "use cache";
  if (role === "admin" || lesson.status === "preview") return true;
  if (typeof userId !== "string" || lesson.status === "private") return false;

  cacheTag(getUserCourseAccessUserTag(userId), getLessonIdTag(lesson.id));

  const [data] = await db
    .select({ courseId: CourseTable.id })
    .from(UserCourseAccessTable)
    .leftJoin(CourseTable, eq(CourseTable.id, UserCourseAccessTable.courseId))
    .leftJoin(
      CourseSectionTable,
      and(
        eq(CourseSectionTable.courseId, CourseTable.id),
        wherePublicCourseSections
      )
    )
    .leftJoin(
      LessonTable,
      and(eq(LessonTable.sectionId, CourseSectionTable.id), wherePublicLessons)
    )
    .where(
      and(
        eq(LessonTable.id, lesson.id),
        eq(UserCourseAccessTable.userId, userId)
      )
    )
    .limit(1);

  return typeof data?.courseId === "string";
}

export const wherePublicLessons = or(
  eq(LessonTable.status, "public"),
  eq(LessonTable.status, "preview")
);
