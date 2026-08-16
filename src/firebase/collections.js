// Firestore collection references — university portal
//
// Schema (for reference):
//
// admin-university/admin            { username, password }  -- single admin doc
//
// departments/{deptId}              { name }
//
// students/{studentId}              {
//   studentId (primary key, e.g. "8029"),
//   fullName, gender, department, faculty, semester,
//   password, pendingDeletion, createdAt
// }
//
// teachers/{username}               {
//   fullName, gender, department, faculty, semester,
//   username, password, subjects: [], classes: [],
//   pendingDeletion, createdAt
// }
//
// classes/{classId}                 {
//   className, department, faculty, semester,
//   teacherId, studentIds: [], pendingDeletion, createdAt
// }
//
// attendance/{attendanceId}         {
//   teacherId, teacherName, subject, className,
//   date (YYYY-MM-DD), time (HH:MM), semester,
//   records: [ { studentId, status: "present"|"absent" } ],
//   createdAt
// }
//
// posts/{postId}                    {
//   authorId, authorName, authorRole ("admin"),
//   text, mediaUrls: [], mediaType: "image"|"video"|null,
//   likes: [uid...], commentCount, createdAt
// }
//
// posts/{postId}/comments/{commentId} {
//   authorName, text, createdAt
// }

export const COLLECTIONS = {
  ADMIN: "admin-university",
  DEPARTMENTS: "departments",
  STUDENTS: "students",
  TEACHERS: "teachers",
  CLASSES: "classes",
  ATTENDANCE: "attendance",
  POSTS: "posts",
};