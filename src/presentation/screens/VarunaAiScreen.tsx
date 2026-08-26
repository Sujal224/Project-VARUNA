import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Send,
  Sparkles,
  Mic,
  Volume2,
  RefreshCw,
  HelpCircle,
  Shield,
  Compass,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { VarunaOrb } from '../components/brand/VarunaOrb';
import { AtmosphericBackground } from '../components/brand/AtmosphericBackground';
import { aiService } from '../../data/services/aiService';
import { ChatMessage } from '../../domain/models/types';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-01',
    sender: 'varuna',
    text: 'Good morning, Captain. Swell and barometric telemetry across Bay of Bengal are optimal. What would you like to explore today?',
    timestamp: '06:00 AM',
    suggestedActions: [
      'Is it safe to go out today?',
      'Show recommended PFZ zone',
      'Explain current swell & wind pattern',
    ],
  },
];

export const VarunaAiScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0) + 6;

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);

    // Simulate AI decision support synthesis
    setTimeout(async () => {
      const response = await aiService.processQuery(textToSend);
      setMessages((prev) => [...prev, response]);
      setIsProcessing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 600);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#02060e" translucent />
      <AtmosphericBackground />

      <View style={styles.safeContainer}>
        {/* Top Header with Apple-like Inset Precision */}
        <View style={[styles.topHeader, { paddingTop: topPadding }]}>
          <View style={styles.headerLeft}>
            <VarunaOrb size={30} />
            <View>
              <Text style={styles.headerTitle}>VARUNA AI</Text>
              <Text style={styles.headerSubtitle}>Maritime Decision Intelligence</Text>
            </View>
          </View>

          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Active</Text>
          </View>
        </View>

        {/* Conversation Stream */}
        <ScrollView
          style={styles.chatScroll}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <View
                key={msg.id}
                style={[
                  styles.messageRow,
                  isUser ? styles.messageRowUser : styles.messageRowVaruna,
                ]}
              >
                {!isUser && (
                  <View style={styles.aiAvatarWrapper}>
                    <VarunaOrb size={28} />
                  </View>
                )}

                <View
                  style={[
                    styles.messageBubble,
                    isUser ? styles.userBubble : styles.varunaBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      isUser ? styles.userText : styles.varunaText,
                    ]}
                  >
                    {msg.text}
                  </Text>

                  {/* Suggested Quick Actions */}
                  {msg.suggestedActions && (
                    <View style={styles.suggestedActionsContainer}>
                      {msg.suggestedActions.map((action, idx) => (
                        <TouchableOpacity
                          key={idx}
                          activeOpacity={0.8}
                          onPress={() => handleSend(action)}
                          style={styles.suggestedActionButton}
                        >
                          <Sparkles size={11} color={Colors.primary} />
                          <Text style={styles.suggestedActionText}>{action}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            );
          })}

          {isProcessing && (
            <View style={styles.processingRow}>
              <VarunaOrb size={28} speed="fast" intensity={1.3} />
              <Text style={styles.processingText}>Synthesizing ocean telemetry...</Text>
            </View>
          )}
        </ScrollView>

        {/* Bottom Input Gateway */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ask about weather, routes, or PFZ zones..."
              placeholderTextColor={Colors.onSurfaceVariant}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => handleSend()}
              returnKeyType="send"
            />
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleSend()}
              style={[
                styles.sendButton,
                inputText.trim().length > 0 && styles.sendButtonActive,
              ]}
            >
              <Send size={16} color={inputText.trim().length > 0 ? '#00363e' : Colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#02060e',
  },
  safeContainer: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    zIndex: 50,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    lineHeight: 20,
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10.5,
    lineHeight: 14,
    color: Colors.onSurfaceVariant,
    marginTop: 1,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00e5ff',
  },
  onlineText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9.5,
    color: '#00e5ff',
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 110,
    gap: 16,
  },
  messageRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowVaruna: {
    justifyContent: 'flex-start',
  },
  aiAvatarWrapper: {
    marginTop: 4,
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '85%',
  },
  userBubble: {
    backgroundColor: '#2563eb',
    borderBottomRightRadius: 4,
  },
  varunaBubble: {
    backgroundColor: 'rgba(28, 43, 60, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  userText: {
    color: '#ffffff',
  },
  varunaText: {
    color: '#d4e4fa',
  },
  suggestedActionsContainer: {
    marginTop: 10,
    gap: 6,
  },
  suggestedActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(34, 211, 238, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  suggestedActionText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: Colors.primary,
  },
  processingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 8,
  },
  processingText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 33, 49, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 9999,
    marginHorizontal: 16,
    marginBottom: 96,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#ffffff',
    paddingVertical: 6,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  sendButtonActive: {
    backgroundColor: Colors.primary,
  },
});
