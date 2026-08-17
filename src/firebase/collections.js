// Firestore collection references — university portal
//
// Schema (for reference):
//
// admin-university/admin            { username, password }  -- single admin doc
//
// departments/{deptId}              { name, pendingDeletion, createdAt }
//
// students/{studentId}              {
//   studentId (primary key, e.g. "8029"),
//   fullName, gender, department, faculty, semester,
//   employment: "full_time" | "part_time",
//   password, pendingDeletion, createdAt
// }
//
// teachers/{username}               {
//   fullName, gender, username, password,
//   assignments: [
//     { department, semester, subject, employment: "full_time"|"part_time", day }
//   ],
//   photo (data URL, optional),
//   pendingDeletion, createdAt
// }
//
// classes/{classId}                 {
//   className, department, faculty, semester,
//   teacherId, studentIds: [], pendingDeletion, createdAt
// }
//
// attendance/{attendanceId}         {
//   teacherId, teacherName, department, semester, subject,
//   employment: "full_time" | "part_time",
//   date (YYYY-MM-DD), time (HH:MM),
//   records: [ { studentId, status: "present"|"absent"|"situation" } ],
//   locked, createdAt
// }
//
// holidays/{holidayId}              {
//   title, startDate (YYYY-MM-DD), endDate (YYYY-MM-DD), createdAt
// }
//   Attendance is blocked for every teacher on any date that falls
//   within [startDate, endDate] of an active holiday.
//
// id_cards/{idNo}                   {
//   idNo, name, title, issue, expiry, photo (data URL),
//   printed, createdAt
// }
//
// posts/{postId}                    {
//   authorId, authorName, authorRole ("admin"|"teacher"|"student"|"user"),
//   text, media: [ { url, type: "image"|"video" } ],
//   likes: [uid...], commentCount, createdAt
// }
//
// posts/{postId}/comments/{commentId} {
//   authorName, authorPhoto, authorRole, text, createdAt
// }

export const COLLECTIONS = {
  ADMIN: "admin-university",
  DEPARTMENTS: "departments",
  STUDENTS: "students",
  TEACHERS: "teachers",
  CLASSES: "classes",
  ATTENDANCE: "attendance",
  HOLIDAYS: "holidays",
  ID_CARDS: "id_cards",
  POSTS: "posts",
};