// components/NotificationCard.js
import React from 'react';
import { TouchableOpacity } from 'react-native';
import AlarmCard from './AlarmCard';

export default function NotificationCard({ alarm, onPress, reviewed }) {
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <AlarmCard alarm={alarm} reviewed={reviewed} />
    </TouchableOpacity>
  );
}
