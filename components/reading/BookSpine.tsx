import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { fonts, radius } from '@/constants/theme';
import { Book } from '@/stores/readingStore';

const SPINE_W = 34;
const SPINE_H = 124;

/** A book rendered as a vertical spine; active books tilt forward + glow. */
export function BookSpine({ book, active, onPress }: { book: Book; active?: boolean; onPress?: () => void }) {
  const title = book.title.length > 18 ? book.title.slice(0, 17) + '…' : book.title;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: SPINE_W,
        height: SPINE_H,
        marginRight: 8,
        transform: [{ rotate: active ? '-4deg' : '0deg' }, { translateY: active ? -6 : 0 }, { scale: pressed ? 0.96 : 1 }],
      })}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: book.color,
          borderTopLeftRadius: radius.sm,
          borderTopRightRadius: radius.sm,
          borderRadius: 4,
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.15)',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          // gilt edge lines
          shadowColor: active ? book.color : '#000',
          shadowOpacity: active ? 0.7 : 0.2,
          shadowRadius: active ? 8 : 3,
          shadowOffset: { width: 0, height: 2 },
        }}
      >
        {/* top + bottom bands */}
        <View style={{ position: 'absolute', top: 8, width: '70%', height: 1, backgroundColor: 'rgba(255,255,255,0.4)' }} />
        <View style={{ position: 'absolute', bottom: 8, width: '70%', height: 1, backgroundColor: 'rgba(255,255,255,0.4)' }} />
        <Text
          numberOfLines={1}
          style={{
            width: SPINE_H - 24,
            textAlign: 'center',
            transform: [{ rotate: '-90deg' }],
            color: '#FBF7EC',
            fontFamily: fonts.serifSemi,
            fontSize: 12.5,
          }}
        >
          {title}
        </Text>
      </View>
    </Pressable>
  );
}
