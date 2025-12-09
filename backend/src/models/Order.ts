/**
 * Order Entity
 * Represents customer orders
 */
export interface Order {
  orderId: number;
  restaurantId: number;
  uniqueCustomerCode?: number;
  addressId?: number;
  orderTime: Date;
  subtotal: number;
  tip: number;
  grandTotal: number;
  orderStatus: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  orderNumber?: string;
}

export interface OrderItem {
  orderItemId: number;
  orderId: number;
  itemId?: number;
  itemName: string;
  itemPrice: number;
  quantity: number;
  subtotal: number;
}

export type OrderCreateInput = Omit<Order, 'orderId' | 'orderTime'>;
export type OrderItemCreateInput = Omit<OrderItem, 'orderItemId'>;

