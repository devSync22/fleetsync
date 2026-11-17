import type { ChatService } from '../types';

import { mockChatService } from './mockChatService';

/** The chat connection used by the app. Swap for the SignalR implementation when the hub exists. */
export const chatService: ChatService = mockChatService;
