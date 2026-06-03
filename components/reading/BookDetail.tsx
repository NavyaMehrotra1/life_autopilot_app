import React, { useEffect, useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useTheme } from '@/lib/ThemeContext';
import { fonts, radius, spacing } from '@/constants/theme';
import { Title, Label, LabelSm, Mono } from '@/components/ui/Type';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { Confetti } from '@/components/ui/Confetti';
import {
  dailyGoal,
  readingStreak,
  useReadingStore,
} from '@/stores/readingStore';
import { useDailyStore } from '@/stores/dailyStore';
import { shortDate } from '@/lib/date';

export function BookDetail({ bookId, onClose }: { bookId: string; onClose?: () => void }) {
  const { colors } = useTheme();
  const book = useReadingStore((s) => s.books.find((b) => b.id === bookId));
  const readDates = useReadingStore((s) => s.readDates);
  const logPages = useReadingStore((s) => s.logPages);
  const finishBook = useReadingStore((s) => s.finishBook);
  const completeDaily = useDailyStore((s) => s.complete);

  const [input, setInput] = useState('');
  const [celebrate, setCelebrate] = useState(false);
  const wasFinished = useRef(book?.status === 'finished');

  useEffect(() => {
    if (book?.status === 'finished' && !wasFinished.current) {
      setCelebrate(true);
      const id = setTimeout(() => setCelebrate(false), 1100);
      return () => clearTimeout(id);
    }
    wasFinished.current = book?.status === 'finished';
  }, [book?.status]);

  if (!book) return null;

  const ratio = book.pagesRead / book.totalPages;
  const goal = dailyGoal(book);
  const streak = readingStreak(readDates);

  const log = (n: number) => {
    if (n <= 0) return;
    logPages(book.id, n);
    completeDaily('read_today');
    setInput('');
  };

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, paddingRight: spacing.md }}>
          <Title>{book.title}</Title>
          <Mono dim style={{ marginTop: 2 }}>{book.author.toLowerCase()}</Mono>
        </View>
        {onClose && (
          <Pressable onPress={onClose} hitSlop={10}>
            <LabelSm dim>close</LabelSm>
          </Pressable>
        )}
      </View>

      <View style={{ marginTop: spacing.lg }}>
        <ProgressBar value={ratio} color={book.color} height={8} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm }}>
          <Mono dim>{book.pagesRead} / {book.totalPages} pages</Mono>
          <Mono dim>{Math.round(ratio * 100)}%</Mono>
        </View>
      </View>

      {book.status !== 'finished' && (
        <View
          style={{
            marginTop: spacing.lg,
            padding: spacing.md,
            borderRadius: radius.md,
            backgroundColor: colors.well,
          }}
        >
          <Mono>
            {book.targetDate && goal > 0
              ? `read ${goal} pages today to finish by ${shortDate(book.targetDate)}.`
              : 'read a little today — that\'s the whole game.'}
          </Mono>
          <LabelSm color={streak > 0 ? colors.sage : colors.muted} style={{ marginTop: spacing.sm }}>
            {streak > 0 ? `${streak}-day streak` : 'start a streak today'}
          </LabelSm>
        </View>
      )}

      {book.status !== 'finished' ? (
        <>
          <Label dim style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}>
            log pages read
          </Label>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <TextInput
              value={input}
              onChangeText={(t) => setInput(t.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              placeholder="pages"
              placeholderTextColor={colors.muted}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.sm,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm + 2,
                color: colors.text,
                fontFamily: fonts.mono,
                fontSize: 14,
              }}
            />
            <Button label="log" tone="sage" onPress={() => log(parseInt(input || '0', 10))} style={{ paddingHorizontal: spacing.lg }} />
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
            {(goal > 0 ? [goal, 25, 50] : [10, 25, 50]).map((n, i) => (
              <Button key={i} label={`+${n}`} variant="ghost" onPress={() => log(n)} style={{ flex: 1, paddingVertical: spacing.sm }} />
            ))}
          </View>
          <Button label="mark as finished" variant="ghost" onPress={() => finishBook(book.id)} style={{ marginTop: spacing.md }} />
        </>
      ) : (
        <Mono color={colors.sage} style={{ marginTop: spacing.lg }}>
          finished{book.finishedAt ? ` · ${shortDate(book.finishedAt)}` : ''}. onto the next one.
        </Mono>
      )}

      {celebrate && <Confetti />}
    </View>
  );
}
