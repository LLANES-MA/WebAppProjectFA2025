/**
 * Delivery Assignment Entity
 * Links orders to drivers for delivery
 */
export interface DeliveryAssignment {
  assignmentId: number;
  orderId: number;
  driverId: number;
  assignedByStaff?: string;
  assignedAt: Date;
  deliveryStatus: 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed';
  deliveredAt?: Date;
}

export type DeliveryAssignmentCreateInput = Omit<DeliveryAssignment, 'assignmentId' | 'assignedAt'>;

