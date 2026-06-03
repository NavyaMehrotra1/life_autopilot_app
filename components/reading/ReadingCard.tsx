import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/lib/ThemeContext';
import { spacing } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { Title, Label, LabelSm, Mono } from '@/components/ui/Type';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { BookSpine } from './BookSpine';
import {
  dailyGoal,
  readingStreak,
  readToday,
  useReadingStore,
} from '@/stores/readingStore';

/** Home-screen reading card: active book + a mini shelf. */
export function ReadingCard({ onPress }: { onPress?: () => void }) {
  const { colors } = useTheme();
  const books = useReadingStore((s) => s.books);
  const readDates = useReadingStore((s) => s.readDates);

  const active = books.find((b) => b.status === 'reading');
  const streak = readingStreak(readDates);
  const shelf = books.slice(0, 6);

  return (
    <Card onPress={onPress}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Title>reading</Title>
        <LabelSm color={streak > 0 ? colors.sage : colors.muted}>
          {streak > 0 ? `${streak}-day streak` : 'no streak yet'}
        </LabelSm>
      </View>

      {books.length === 0 ? (
        <Mono dim style={{ marginTop: spacing.sm }}>
          no books on the shelf yet. add one and i'll keep your pace.
        </Mono>
      ) : (
        <>
          {active && (
            <View style={{ marginTop: spacing.md }}>
              <Mono numberOfLines={1}>{active.title.toLowerCase()}</Mono>
              <View style={{ marginTop: spacing.sm }}>
                <ProgressBar value={active.pagesRead / active.totalPages} color={active.color} height={6} />
              </View>
              <Mono dim style={{ marginTop: spacing.sm, fontSize: 11 }}>
                {readToday(readDates)
                  ? 'read today — nicely done.'
                  : dailyGoal(active) > 0
                    ? `${dailyGoal(active)} pages keeps you on track`
                    : 'pick it up when you can'}
              </Mono>
            </View>
          )}

          <View style={{ flexDirection: 'row', marginTop: spacing.lg, alignItems: 'flex-end' }}>
            {shelf.map((b) => (
              <BookSpine key={b.id} book={b} active={b.id === active?.id} onPress={onPress} />
            ))}
          </View>
        </>
      )}
    </Card>
  );
}
