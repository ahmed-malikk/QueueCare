/**
 * QueueCare waiting-room display: what the "Now serving" screen shows.
 * The database function waiting_room (migration 003) has already put the queue in order and
 * returns token numbers only; this just turns them into what the screen prints.
 */
import { formatToken } from "./registration";

/** Exactly what waiting_room returns. `priority` (called out of order) is still recorded by the
 *  database for reports, but since v1.1 the screen no longer shows it. */
export type WaitingRoomResponse = {
  with_doctor: number | null;
  priority: boolean;
  next: number[];
  waiting_count: number;
};

export type WaitingRoomView = {
  nowServing: string | null;
  next: string[];
  waitingCount: number;
};

export function describeWaitingRoom(response: WaitingRoomResponse): WaitingRoomView {
  return {
    nowServing: response.with_doctor === null ? null : formatToken(response.with_doctor),
    next: response.next.slice(0, 3).map(formatToken),
    waitingCount: response.waiting_count,
  };
}
