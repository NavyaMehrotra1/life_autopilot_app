import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { asyncPersist, uid } from '@/lib/persist';
import { dayKey, daysUntil } from '@/lib/date';

export type BookStatus = 'reading' | 'next' | 'finished';

/** Earthy spine colors, cycled as books are added. */
export const SPINE_COLORS = ['#B0654A', '#7A9A6A', '#3C4A63', '#C8922A', '#8C3B3B', '#6B5B7B'];

export type Book = {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  pagesRead: number;
  targetDate: string | null; // ISO
  status: BookStatus;
  color: string;
  addedAt: string;
  finishedAt?: string;
};

export type NewBook = {
  title: string;
  author: string;
  totalPages: number;
  targetDate?: string | null;
  status?: BookStatus;
};

type ReadingState = {
  books: Book[];
  /** Global day keys on which the user logged any reading — drives the streak. */
  readDates: string[];

  addBook: (b: NewBook) => string;
  logPages: (id: string, pages: number) => void;
  setActive: (id: string) => void;
  finishBook: (id: string) => void;
  removeBook: (id: string) => void;
};

export const useReadingStore = create<ReadingState>()(
  persist(
    (set, get) => ({
      books: [],
      readDates: [],

      addBook: (b) => {
        const book: Book = {
          id: uid('book'),
          title: b.title.trim(),
          author: b.author.trim(),
          totalPages: Math.max(1, b.totalPages),
          pagesRead: 0,
          targetDate: b.targetDate ?? null,
          status: b.status ?? 'reading',
          color: SPINE_COLORS[get().books.length % SPINE_COLORS.length],
          addedAt: new Date().toISOString(),
        };
        set({ books: [...get().books, book] });
        return book.id;
      },

      logPages: (id, pages) => {
        const today = dayKey();
        set((s) => {
          const books = s.books.map((bk) => {
            if (bk.id !== id) return bk;
            const pagesRead = Math.min(bk.totalPages, bk.pagesRead + Math.max(0, pages));
            const finished = pagesRead >= bk.totalPages;
            return {
              ...bk,
              pagesRead,
              status: finished ? ('finished' as const) : bk.status,
              finishedAt: finished ? new Date().toISOString() : bk.finishedAt,
            };
          });
          return {
            books,
            readDates: s.readDates.includes(today)
              ? s.readDates
              : [...s.readDates, today],
          };
        });
      },

      setActive: (id) =>
        set((s) => ({
          books: s.books.map((bk) =>
            bk.id === id && bk.status !== 'finished'
              ? { ...bk, status: 'reading' }
              : bk,
          ),
        })),

      finishBook: (id) =>
        set((s) => ({
          books: s.books.map((bk) =>
            bk.id === id
              ? {
                  ...bk,
                  status: 'finished',
                  pagesRead: bk.totalPages,
                  finishedAt: new Date().toISOString(),
                }
              : bk,
          ),
        })),

      removeBook: (id) =>
        set((s) => ({ books: s.books.filter((bk) => bk.id !== id) })),
    }),
    asyncPersist<ReadingState>('reading'),
  ),
);

/** Pages/day needed to finish by the target date. 0 if no target or finished. */
export function dailyGoal(book: Book): number {
  if (!book.targetDate || book.status === 'finished') return 0;
  const remaining = book.totalPages - book.pagesRead;
  if (remaining <= 0) return 0;
  const days = Math.max(1, daysUntil(book.targetDate));
  return Math.ceil(remaining / days);
}

/** Consecutive days (ending today or yesterday) with a reading log. */
export function readingStreak(readDates: string[]): number {
  if (readDates.length === 0) return 0;
  const set = new Set(readDates);
  let streak = 0;
  const cursor = new Date();
  // Allow today to be unread yet without breaking yesterday's streak.
  if (!set.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (set.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function readToday(readDates: string[]): boolean {
  return readDates.includes(dayKey());
}
