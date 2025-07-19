import type { LessonStatus } from "@/drizzle/schema";

export interface Lesson {
  id: string;
  name: string;
  status: LessonStatus;
  youtubeVideoId: string;
  description: string | null;
  sectionId: string;
}

export interface Section {
  id: string;
  name: string;
}
