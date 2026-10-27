import { db } from './index.ts';
import { users } from './schema.ts';

export async function getOrCreateUser(uid: string, email: string, displayName?: string, classGrade?: string) {
  try {
    const result = await db.insert(users)
      .values({
        uid,
        email,
        displayName: displayName || null,
        classGrade: classGrade || null,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          ...(displayName ? { displayName } : {}),
          ...(classGrade ? { classGrade } : {}),
          updatedAt: new Date(),
        },
      })
      .returning();

    if (result && result[0]) {
      return result[0];
    }
    return {
      uid,
      email,
      displayName: displayName || null,
      classGrade: classGrade || null,
      role: 'student',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.warn('Database fallback in getOrCreateUser:', error);
    return {
      uid,
      email,
      displayName: displayName || null,
      classGrade: classGrade || null,
      role: 'student',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
