import { ClassSection, Student } from '../models';

/**
 * Return the student classes that are both enrolled and consistent with the student's major.
 * This avoids showing outdated enrollment records that belong to a different major.
 */
export function getConsistentStudentClasses(classes: ClassSection[], studentProfile: Student) {
  return classes.filter((cls) => {
    const isEnrolled = cls.studentIds.includes(studentProfile.id);
    const majorMatches =
      !studentProfile.majorId ||
      !cls.majorId ||
      cls.majorId === studentProfile.majorId;

    return isEnrolled && majorMatches;
  });
}
