/**
 * Order Queue Entity
 * Tracks orders in the processing queue
 */
export interface OrderQueue {
  queueId: number;
  orderId: number;
  queuedAt: Date;
  processedByStaff?: string;
  dequeuedAt?: Date;
  status: 'queued' | 'processing' | 'completed' | 'cancelled';
}

export type OrderQueueCreateInput = Omit<OrderQueue, 'queueId' | 'queuedAt'>;

