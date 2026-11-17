/** The thread on screen right now (focused chat room + selected person), so notifications can skip it. */
let visible: { roomId: string; participantId: string } | null = null;

export function setVisibleThread(thread: { roomId: string; participantId: string } | null) {
  visible = thread;
}

export function isThreadVisible(roomId: string, participantId: string): boolean {
  return visible?.roomId === roomId && visible.participantId === participantId;
}
