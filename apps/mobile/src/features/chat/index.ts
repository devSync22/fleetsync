/** Public entry for the chat feature. Routes and other features import from `@/features/chat` only. */
export { ChatProvider, useChat } from './ChatProvider';
export { ChatRoomsScreen } from './screens/ChatRoomsScreen';
export { ChatRoomScreen } from './screens/ChatRoomScreen';
export { canMessage, isRoomReadOnly } from './permissions';
export { chatListHref, chatRoomHref } from './routes';
export { isThreadVisible } from './visibleThread';
export { chatService } from './services/chatService';
export type { ChatRole, ChatRoom, ChatService, Message, MessageStatus, Participant } from './types';
