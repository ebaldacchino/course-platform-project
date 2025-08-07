"use server";

import { getCurrentUser } from "@/services/clerk";
import { updateLessonCompleteStatus as updateLessonCompleteStatusDb } from "./userLessonComplete.db";
import { canUpdateUserLessonCompleteStatus } from "./userLessonComplete.permissions";

export async function updateLessonCompleteStatus(
  lessonId: string,
  complete: boolean
) {
  const { userId } = await getCurrentUser();

  const hasPermission = await canUpdateUserLessonCompleteStatus(
    { userId },
    lessonId
  );

  if (!userId || !hasPermission) {
    return { error: true, message: "Error updating lesson completion status" };
  }

  await updateLessonCompleteStatusDb({ lessonId, userId, complete });

  return {
    error: false,
    message: "Successfully updated lesson completion status",
  };
}
