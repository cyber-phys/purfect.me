import type { ChatOptions, ReceivedChatMessage } from '@/components/chat/chat';
import { setupChat } from '@/components/chat/chat';
import * as React from 'react';
import { useRoomContext } from '@livekit/components-react';
import { useObservableState } from '@/components/chat/useObservableState';

/**
 * The `useChat` hook provides chat functionality for a LiveKit room.
 * It returns a simple `send` function to send chat messages, an array of `chatMessages` to hold received messages,
 * an `update` function that allows you to implement message-edit functionality, and an `overwriteChatMessages` function
 * to overwrite the chat messages.
 * @remarks
 * It is possible to pass configurations for custom message encoding and decoding and non-default topics on which to send the messages.
 * @public
 */
export function useChat(options?: ChatOptions) {
  const room = useRoomContext();
  const [setup, setSetup] = React.useState<ReturnType<typeof setupChat>>();
  const isSending = useObservableState(setup?.isSendingObservable, false);
  const chatMessages = useObservableState<ReceivedChatMessage[]>(setup?.messageObservable, []);

  React.useEffect(() => {
    const setupChatReturn = setupChat(room, options);
    setSetup(setupChatReturn);
  }, [room, options]);

  return { send: setup?.send, update: setup?.update, updateHistory: setup?.updateHistory, chatMessages, isSending };
}