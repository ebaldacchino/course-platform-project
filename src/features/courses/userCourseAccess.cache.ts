import { getGlobalTag, getIdTag, getUserTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

interface UserCourseAccess {
  courseId: string;
  userId: string;
}

export function getUserCourseAccessGlobalTag() {
  return getGlobalTag("userCourseAccess");
}

export function getUserCourseAccessIdTag({
  courseId,
  userId,
}: UserCourseAccess) {
  return getIdTag("userCourseAccess", `course:${courseId}-user:${userId}`);
}

export function getUserCourseAccessUserTag(userId: string) {
  return getUserTag("userCourseAccess", userId);
}

export function revalidateUserCourseAccessCache({
  courseId,
  userId,
}: UserCourseAccess) {
  revalidateTag(getUserCourseAccessGlobalTag());
  revalidateTag(getUserCourseAccessIdTag({ courseId, userId }));
  revalidateTag(getUserCourseAccessUserTag(userId));
}
