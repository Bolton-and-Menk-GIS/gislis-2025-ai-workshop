export interface ChatMessage<R = unknown> {
  role: 'user' | 'assistant';
  /**
   * the message content
   */
  content: string;
  /** 
   * any extra result payload
   */
  result?: R;
  isWelcomeMessage?: boolean;
}
