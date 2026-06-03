import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/lib/ThemeContext';
import { spacing } from '@/constants/theme';
import { Label, Mono } from '@/components/ui/Type';
import { BookSpine } from './BookSpine';
import { Book } from '@/stores/readingStore';

function Shelf({
  title,
  books,
  empty,
  activeId,
  onSelect,
}: {
  title: string;
  books: Book[];
  empty: string;
  activeId?: string;
  onSelect?: (b: Book) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ marginBottom: spacing.xl }}>
      <Label dim style={{ marginBottom: spacing.sm }}>
        {title}
      </Label>
      {books.length === 0 ? (
        <Mono dim>{empty}</Mono>
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.md, alignItems: 'flex-end' }}>
          {books.map((b) => (
            <BookSpine key={b.id} book={b} active={b.id === activeId} onPress={() => onSelect?.(b)} />
          ))}
        </View>
      )}
      {/* the shelf plank */}
      <View style={{ height: 5, borderRadius: 2, backgroundColor: colors.border, marginTop: 2 }} />
    </View>
  );
}

export function Bookshelf({
  books,
  activeId,
  onSelect,
}: {
  books: Book[];
  activeId?: string;
  onSelect?: (b: Book) => void;
}) {
  const reading = books.filter((b) => b.status === 'reading');
  const next = books.filter((b) => b.status === 'next');
  const finished = books.filter((b) => b.status === 'finished');

  return (
    <View>
      <Shelf title="currently reading" books={reading} empty="no book in your hands yet." activeId={activeId} onSelect={onSelect} />
      <Shelf title="up next" books={next} empty="nothing queued — what's calling you?" onSelect={onSelect} />
      <Shelf title="finished" books={finished} empty="your finished shelf is waiting." onSelect={onSelect} />
    </View>
  );
}
