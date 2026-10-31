/**
 * BuzzingBrain Client MongoDB Storage & Synchronization Service
 * 
 * Synchronizes:
 * 1. User Profiles & Custom Avatars & Parent Details
 * 2. Study Notes & Handwritten Formula Sheets
 * 3. 50-Year Examination Attempts & Analytics
 * 4. Error Logs & AI Mistake Books
 * 5. Student Grievance Complaint Tickets
 */

import { UserProfile, StudyNote, ComplaintTicket } from '../types';

export interface MongoStatusInfo {
  connected: boolean;
  dbName: string;
  collections: string[];
  inMemoryFallback: boolean;
  docCounts?: Record<string, number>;
}

export interface MongoTestAttemptPayload {
  userId: string;
  testId: string;
  examType: string;
  subject: string;
  score: number;
  totalMarks: number;
  accuracy: number;
  timeSpentSec: number;
  completedAt: string;
  chapterBreakdown?: Record<string, { correct: number; total: number }>;
  weakTopics?: string[];
  strongTopics?: string[];
}

export interface MongoMistakePayload {
  userId: string;
  questionId: string;
  questionText: string;
  subject: string;
  chapter: string;
  examType: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  mistakeTag: 'calculation' | 'conceptual' | 'formula_recall' | 'reading_trap';
  recordedAt: string;
}

/**
 * Checks connection diagnostics of MongoDB cluster
 */
export async function checkMongoStatus(): Promise<MongoStatusInfo> {
  try {
    const res = await fetch('/api/mongo/status');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.status || { connected: false, dbName: 'fallback', collections: [], inMemoryFallback: true };
  } catch (err) {
    return {
      connected: false,
      dbName: 'offline-cache',
      collections: [],
      inMemoryFallback: true
    };
  }
}

/**
 * Synchronizes user profile (avatar, parent info, role, curriculum targets) to MongoDB
 */
export async function syncUserProfileToMongo(user: Partial<UserProfile>): Promise<boolean> {
  if (!user || !user.uid) return false;
  try {
    const res = await fetch('/api/mongo/users/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.success);
  } catch (err) {
    console.warn('[MongoDB Sync] Failed to sync user profile to remote, cached locally.', err);
    return false;
  }
}

/**
 * Retrieves student profile from MongoDB
 */
export async function fetchUserFromMongo(uid: string): Promise<UserProfile | null> {
  if (!uid) return null;
  try {
    const res = await fetch(`/api/mongo/users/${encodeURIComponent(uid)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
}

/**
 * Saves a study note to MongoDB
 */
export async function saveNoteToMongo(note: StudyNote): Promise<StudyNote | null> {
  try {
    const res = await fetch('/api/mongo/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note)
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.note || null;
  } catch (err) {
    console.warn('[MongoDB Sync] Note saved offline, will sync when connected.', err);
    return null;
  }
}

/**
 * Fetches notes from MongoDB for user and/or class
 */
export async function fetchNotesFromMongo(params?: {
  userId?: string;
  classGrade?: string;
  subject?: string;
  chapter?: string;
}): Promise<StudyNote[]> {
  try {
    const query = new URLSearchParams();
    if (params?.userId) query.set('userId', params.userId);
    if (params?.classGrade) query.set('classGrade', params.classGrade);
    if (params?.subject) query.set('subject', params.subject);
    if (params?.chapter) query.set('chapter', params.chapter);

    const res = await fetch(`/api/mongo/notes?${query.toString()}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.notes || [];
  } catch {
    return [];
  }
}

/**
 * Deletes a note from MongoDB
 */
export async function deleteNoteFromMongo(noteId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/mongo/notes/${encodeURIComponent(noteId)}`, {
      method: 'DELETE'
    });
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.success && data.deleted);
  } catch {
    return false;
  }
}

/**
 * Records an examination attempt in MongoDB
 */
export async function recordTestAttemptToMongo(attempt: MongoTestAttemptPayload): Promise<boolean> {
  try {
    const res = await fetch('/api/mongo/tests/attempt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attempt)
    });
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.success);
  } catch {
    return false;
  }
}

/**
 * Fetches past test attempts for a student
 */
export async function fetchTestAttemptsFromMongo(userId: string, testId?: string): Promise<MongoTestAttemptPayload[]> {
  if (!userId) return [];
  try {
    const query = testId ? `?testId=${encodeURIComponent(testId)}` : '';
    const res = await fetch(`/api/mongo/tests/attempts/${encodeURIComponent(userId)}${query}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.attempts || [];
  } catch {
    return [];
  }
}

/**
 * Adds an error to the student's Mistake Book in MongoDB
 */
export async function saveMistakeToMongo(mistake: MongoMistakePayload): Promise<boolean> {
  try {
    const res = await fetch('/api/mongo/mistakes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mistake)
    });
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.success);
  } catch {
    return false;
  }
}

/**
 * Fetches mistake book records for student review
 */
export async function fetchMistakesFromMongo(userId: string): Promise<MongoMistakePayload[]> {
  if (!userId) return [];
  try {
    const res = await fetch(`/api/mongo/mistakes/${encodeURIComponent(userId)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.mistakes || [];
  } catch {
    return [];
  }
}

/**
 * Submits student grievance / complaint ticket to MongoDB
 */
export async function submitComplaintToMongo(complaint: Partial<ComplaintTicket>): Promise<ComplaintTicket | null> {
  try {
    const res = await fetch('/api/mongo/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(complaint)
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.complaint || null;
  } catch {
    return null;
  }
}

/**
 * Bulk migrates local application memory / localStorage stores into MongoDB
 */
export async function migrateLocalDataToMongo(payload: {
  users?: any[];
  notes?: any[];
  attempts?: any[];
  mistakes?: any[];
  complaints?: any[];
}): Promise<{ inserted: Record<string, number>; errors: string[] }> {
  try {
    const res = await fetch('/api/mongo/migrate-from-local', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return {
      inserted: data.inserted || {},
      errors: data.errors || []
    };
  } catch (err: any) {
    return {
      inserted: {},
      errors: [err.message || 'Network migration error']
    };
  }
}
