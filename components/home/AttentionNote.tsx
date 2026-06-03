import React from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '@/lib/ThemeContext';
import { StickyNote } from '@/components/ui/StickyNote';
import { ArrowRow } from '@/components/ui/ArrowRow';
import { Mono } from '@/components/ui/Type';
import { AttentionItem } from '@/lib/attention';

const toneColor = (tone: AttentionItem['tone'], c: ReturnType<typeof useTheme>['colors']) =>
  tone === 'red' ? c.red : tone === 'amber' ? c.amber : tone === 'sage' ? c.sage : c.muted;

/** The "immediate attention" sticky note — max 4 items, ruthlessly triaged. */
export function AttentionNote({ items }: { items: AttentionItem[] }) {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <StickyNote title="immediate attention">
      {items.length === 0 ? (
        <Mono dim>nothing's on fire. go be a person.</Mono>
      ) : (
        items.map((it) => (
          <ArrowRow
            key={it.id}
            label={it.label}
            timing={it.timing}
            timingColor={toneColor(it.tone, colors)}
            onPress={it.route ? () => router.push(it.route as any) : undefined}
          />
        ))
      )}
    </StickyNote>
  );
}
