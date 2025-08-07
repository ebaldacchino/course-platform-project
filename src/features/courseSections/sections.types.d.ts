import type { CourseSectionStatus } from "@/drizzle/schema";

export interface Section {
  id: string;
  name: string;
  status: CourseSectionStatus;
}
