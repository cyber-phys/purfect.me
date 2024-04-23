/* eslint-disable camelcase */
import type { Participant, Room } from 'livekit-client';
import { RoomEvent } from 'livekit-client';
import { BehaviorSubject, Subject, scan, map, takeUntil } from 'rxjs';
// import { DataTopic, sendMessage, setupDataMessageHandler } from '../observables/dataChannel';
import { DataTopic, sendMessage, setupDataMessageHandler } from '@livekit/components-core';


/** @public */
export interface ChatMessage {
  id: string;
  timestamp: number;
  message: string;
  is_assistant: boolean;
  highlight_word_count: number;
  deleted: boolean;
  participant: string;
  parent_id: string;
  alt_ids: string[];
  conversation_id: string;
  character_id: string;
  model: string;
  type: string;
}

/** @public */
export interface ReceivedChatMessage extends ChatMessage {
  from?: Participant;
  editTimestamp?: number;
}

/** @public */
export type MessageEncoder = (message: ChatMessage) => Uint8Array;
/** @public */
export type MessageDecoder = (message: Uint8Array) => ReceivedChatMessage;
/** @public */
export type ChatOptions = {
  messageEncoder?: (message: ChatMessage) => Uint8Array;
  messageDecoder?: (message: Uint8Array) => ReceivedChatMessage;
  channelTopic?: string;
  updateChannelTopic?: string;
};

type RawMessage = {
  payload: Uint8Array;
  topic: string | undefined;
  from: Participant | undefined;
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const topicSubjectMap: Map<Room, Map<string, Subject<RawMessage>>> = new Map();

const encode = (message: ChatMessage) => encoder.encode(JSON.stringify(message));
const encodeArray = (messages: ChatMessage[]): Uint8Array => encoder.encode(JSON.stringify(messages));

const decode = (message: Uint8Array) => JSON.parse(decoder.decode(message)) as ReceivedChatMessage;
const decodeArray = (message: Uint8Array): ChatMessage[] => JSON.parse(decoder.decode(message)) as ChatMessage[];


export function setupChat(room: Room, options?: ChatOptions) {
  const onDestroyObservable = new Subject<void>();

  const { messageDecoder, messageEncoder, channelTopic, updateChannelTopic } = options ?? {};

  const topic = channelTopic ?? DataTopic.CHAT;

  const updateTopic = updateChannelTopic ?? DataTopic.CHAT_UPDATE;

  let needsSetup = false;
  if (!topicSubjectMap.has(room)) {
    needsSetup = true;
  }
  const topicMap = topicSubjectMap.get(room) ?? new Map<string, Subject<RawMessage>>();
  const messageSubject = topicMap.get(topic) ?? new Subject<RawMessage>();
  topicMap.set(topic, messageSubject);
  topicSubjectMap.set(room, topicMap);

  if (needsSetup) {
    /** Subscribe to all appropriate messages sent over the wire. */
    const { messageObservable } = setupDataMessageHandler(room, [topic, updateTopic]);
    messageObservable.pipe(takeUntil(onDestroyObservable)).subscribe(messageSubject);
  }

  const finalMessageDecoder = messageDecoder ?? decode;

  const historyUpdateTopic = 'chat_history_update';

  /** Build up the message array over time. */
  const messagesObservable = messageSubject.pipe(
    map((msg) => {
      if (msg.topic === historyUpdateTopic) {
        console.log(msg.payload)
        const parsedMessages = decodeArray(msg.payload);
        return parsedMessages;
      } else {
        const parsedMessage = finalMessageDecoder(msg.payload);
        const newMessage: ReceivedChatMessage = { ...parsedMessage, from: msg.from };
        return [newMessage];
      }
    }),
    scan<ReceivedChatMessage[], ReceivedChatMessage[]>((acc, values) => {
      if (values.length > 1) {
        // History update
        return values;
      } else {
        const value = values[0];
        // Handle message updates
        if (
          'id' in value &&
          acc.find((msg) => msg.from?.identity === value.from?.identity && msg.id === value.id)
        ) {
          const replaceIndex = acc.findIndex((msg) => msg.id === value.id);
          if (replaceIndex > -1) {
            const originalMsg = acc[replaceIndex];
            acc[replaceIndex] = {
              ...value,
              timestamp: originalMsg.timestamp,
              editTimestamp: value.timestamp,
            };
          }
          return [...acc];
        }
        return [...acc, value];
      }
    }, []),
    takeUntil(onDestroyObservable),
  );

  const isSending$ = new BehaviorSubject<boolean>(false);

  const finalMessageEncoder = messageEncoder ?? encode;

  const send = async (message: string) => {
    const timestamp = Date.now();
    const id = crypto.randomUUID();
    const chatMessage: ChatMessage = {
      id,
      message,
      timestamp,
      is_assistant: false,
      highlight_word_count: 0,
      deleted: false, // Assuming default value
      participant: 'participant_id', // Replace with actual participant ID
      parent_id: '', // Adjust as necessary
      alt_ids: [id], // Adjust as necessary
      conversation_id: 'conversation_id', // Replace with actual conversation ID
      character_id: 'character_id', // Replace with actual character ID
      model: 'model_name', // Replace with actual model name
      type: 'message_type' // Replace with actual message type
    };    const encodedMsg = finalMessageEncoder(chatMessage);
    isSending$.next(true);
    try {
      await sendMessage(room.localParticipant, encodedMsg, {
        reliable: true,
        topic,
      });
      messageSubject.next({
        payload: encodedMsg,
        topic: topic,
        from: room.localParticipant,
      });
      return chatMessage;
    } finally {
      isSending$.next(false);
    }
  };

  const update = async (message: string, messageId: string) => {
    const timestamp = Date.now();
    const chatMessage: ChatMessage = {
      id: messageId,
      message,
      timestamp,
      is_assistant: false,
      highlight_word_count: 0,
      deleted: false, // Assuming false as a placeholder
      participant: 'participant_id', // Replace 'participant_id' with actual participant ID
      parent_id: '', // Assuming no parent, adjust as necessary
      alt_ids: [messageId],
      conversation_id: 'conversation_id', // Replace 'conversation_id' with actual conversation ID
      character_id: 'character_id', // Replace 'character_id' with actual character ID
      model: 'model_name', // Replace 'model_name' with actual model name
      type: 'message_type' // Replace 'message_type' with actual message type
    };
    const encodedMsg = finalMessageEncoder(chatMessage);
    isSending$.next(true);
    try {
      await sendMessage(room.localParticipant, encodedMsg, {
        topic: updateTopic,
        reliable: true,
      });
      messageSubject.next({
        payload: encodedMsg,
        topic: topic,
        from: room.localParticipant,
      });
      return chatMessage;
    } finally {
      isSending$.next(false);
    }
  };

  const updateHistory = async (messages: ChatMessage[]) => {
    console.log("updating history")
    const encodedMsg = encodeArray(messages);
    try {
      await sendMessage(room.localParticipant, encodedMsg, {
        topic: historyUpdateTopic,
        reliable: true,
      });
      messageSubject.next({
        payload: encodedMsg,
        topic: historyUpdateTopic,
        from: room.localParticipant,
      });
    } catch (error) {
      console.error('Error updating chat history:', error);
    }
  };

  function destroy() {
    onDestroyObservable.next();
    onDestroyObservable.complete();
    topicSubjectMap.clear();
  }
  room.once(RoomEvent.Disconnected, destroy);

  return { messageObservable: messagesObservable, isSendingObservable: isSending$, send, update, updateHistory };
}
