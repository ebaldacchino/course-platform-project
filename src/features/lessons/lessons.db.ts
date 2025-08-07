import { db } from "@/drizzle/db";
import { CourseSectionTable, LessonTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidateLessonCache } from "./lessons.cache";

export async function getNextCourseLessonOrder(sectionId: string) {
  const lesson = await db.query.LessonTable.findFirst({
    columns: { order: true },
    where: ({ sectionId: sectionIdCol }, { eq }) => eq(sectionIdCol, sectionId),
    orderBy: ({ order }, { desc }) => desc(order),
  });

  return lesson ? lesson.order + 1 : 0;
}

export async function insertLesson(data: typeof LessonTable.$inferInsert) {
  const [newLesson, courseId] = await db.transaction(async (transaction) => {
    const insertLesson = transaction
      .insert(LessonTable)
      .values(data)
      .returning();

    const findCourseSectionForLesson =
      transaction.query.CourseSectionTable.findFirst({
        columns: { courseId: true },
        where: eq(CourseSectionTable.id, data.sectionId),
      });

    const promises = [insertLesson, findCourseSectionForLesson] as const;

    const [[newLesson], section] = await Promise.all(promises);

    if (!section) return transaction.rollback();

    return [newLesson, section.courseId];
  });
  if (!newLesson) throw new Error("Failed to create lesson");

  revalidateLessonCache({ courseId, id: newLesson.id });

  return newLesson;
}

export async function updateLesson(
  id: string,
  data: Partial<typeof LessonTable.$inferInsert>
) {
  const [updatedLesson, courseId] = await db.transaction(
    async (transaction) => {
      const currentLesson = await transaction.query.LessonTable.findFirst({
        where: eq(LessonTable.id, id),
        columns: { sectionId: true },
      });

      if (
        typeof data.sectionId === "string" &&
        currentLesson?.sectionId !== data.sectionId &&
        typeof data.order === "number"
      ) {
        data.order = await getNextCourseLessonOrder(data.sectionId);
      }

      const [updatedLesson] = await transaction
        .update(LessonTable)
        .set(data)
        .where(eq(LessonTable.id, id))
        .returning();

      if (!updatedLesson) {
        transaction.rollback();
        throw new Error("Failed to update lesson");
      }

      const section = await transaction.query.CourseSectionTable.findFirst({
        columns: { courseId: true },
        where: eq(CourseSectionTable.id, updatedLesson.sectionId),
      });

      if (!section) return transaction.rollback();

      return [updatedLesson, section.courseId];
    }
  );

  revalidateLessonCache({ courseId, id: updatedLesson.id });

  return updatedLesson;
}

export async function deleteLesson(id: string) {
  const [deletedLesson, courseId] = await db.transaction(
    async (transaction) => {
      const [deletedLesson] = await transaction
        .delete(LessonTable)
        .where(eq(LessonTable.id, id))
        .returning();

      if (!deletedLesson) {
        transaction.rollback();
        throw new Error("Failed to delete lesson");
      }

      const section = await transaction.query.CourseSectionTable.findFirst({
        columns: { courseId: true },
        where: ({ id }, { eq }) => eq(id, deletedLesson.sectionId),
      });

      if (!section) return transaction.rollback();

      return [deletedLesson, section.courseId];
    }
  );

  revalidateLessonCache({
    id: deletedLesson.id,
    courseId,
  });

  return deletedLesson;
}

export async function updateLessonOrders(lessonIds: string[]) {
  const [lessons, courseId] = await db.transaction(async (transaction) => {
    const updateLessonsPromises = lessonIds.map((id, index) =>
      db
        .update(LessonTable)
        .set({ order: index })
        .where(eq(LessonTable.id, id))
        .returning({
          sectionId: LessonTable.sectionId,
          id: LessonTable.id,
        })
    );

    const lessons = await Promise.all(updateLessonsPromises);

    const sectionId = lessons[0]?.[0]?.sectionId;

    if (!sectionId) return transaction.rollback();

    const section = await transaction.query.CourseSectionTable.findFirst({
      columns: { courseId: true },
      where: ({ id }, { eq }) => eq(id, sectionId),
    });

    if (!section) return transaction.rollback();

    return [lessons, section.courseId];
  });

  lessons.flat().forEach(({ id }) => {
    revalidateLessonCache({
      courseId,
      id,
    });
  });
}
