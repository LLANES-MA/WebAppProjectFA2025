/**
 * Order Service
 * Manages OrderEntity and related operations
 */

import { db } from '../data/Database';
import { pool } from '../data/dbConnection';
import { Order, OrderCreateInput, OrderItem, OrderItemCreateInput } from '../models/Order';
import { OrderQueue, OrderQueueCreateInput } from '../models/OrderQueue';

export class OrderService {
  /**
   * Create a new order
   */
  async createOrder(input: OrderCreateInput, items: OrderItemCreateInput[]): Promise<Order> {
    // Create order
    const order = await db.createOrder(input);
    
    // Create order items
    for (const item of items) {
      await db.createOrderItem({
        ...item,
        orderId: order.orderId,
      });
    }
    
    // Add to order queue
    await db.createOrderQueue({
      orderId: order.orderId,
      status: 'queued',
    });
    
    return order;
  }

  /**
   * Create order with customer and address
   */
  async createOrderWithCustomer(data: {
    restaurantId: number;
    subtotal: number;
    tip: number;
    grandTotal: number;
    orderStatus: Order['orderStatus'];
    address?: {
      street: string;
      apartment?: string;
      city: string;
      state: string;
      zipCode: string;
    };
    customer?: {
      email: string;
      phone: string;
      fullName?: string;
    };
    items: OrderItemCreateInput[];
  }): Promise<Order> {
    let addressId: number | undefined;
    let customerCode: number | undefined;

    // Create address if provided
    if (data.address) {
      // Parse address into building_number and street_name
      // Extract building number from street address (e.g., "123 Main St" -> "123" and "Main St")
      const streetMatch = data.address.street.match(/^(\d+)\s+(.+)$/);
      const buildingNumber = streetMatch ? streetMatch[1] : null;
      const streetName = streetMatch ? streetMatch[2] : data.address.street;
      
      // Append apartment if provided
      const finalStreetName = data.address.apartment 
        ? `${streetName}, ${data.address.apartment}`
        : streetName;
      
      const addressQuery = `
        INSERT INTO Address (building_number, street_name, city, state, zip)
        VALUES (?, ?, ?, ?, ?)
      `;
      const [addressResult] = await pool.execute(addressQuery, [
        buildingNumber,
        finalStreetName,
        data.address.city,
        data.address.state,
        data.address.zipCode,
      ]) as any;
      addressId = addressResult.insertId;
    }

    // Create customer if provided
    if (data.customer && addressId) {
      // Extract credit card info from customer data if available
      // For now, we'll create customer with minimal info
      const customer = await db.createCustomer({
        fullName: data.customer.fullName || data.customer.email.split('@')[0],
        creditNum: undefined, // Payment info not stored for security
        creditExp: undefined,
        creditCcv: undefined,
        addressId: addressId,
      });
      customerCode = customer.uniqueCustomerCode;
    }

    // Create order
    const orderInput: OrderCreateInput = {
      restaurantId: data.restaurantId,
      uniqueCustomerCode: customerCode,
      addressId: addressId,
      subtotal: data.subtotal,
      tip: data.tip,
      grandTotal: data.grandTotal,
      orderStatus: data.orderStatus,
      orderNumber: `FD${Date.now().toString(36).toUpperCase()}`,
    };

    return await this.createOrder(orderInput, data.items);
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: number): Promise<Order | undefined> {
    return await db.getOrder(orderId);
  }

  /**
   * Get order by order number
   */
  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    return await db.getOrderByNumber(orderNumber);
  }

  /**
   * Get order with items by order ID
   */
  async getOrderWithItems(orderId: number): Promise<{ order: Order; items: OrderItem[] } | undefined> {
    const order = await db.getOrder(orderId);
    if (!order) return undefined;
    
    const items = await db.getOrderItems(orderId);
    return { order, items };
  }

  /**
   * Get order with items by order number
   */
  async getOrderWithItemsByNumber(orderNumber: string): Promise<{ order: Order; items: OrderItem[] } | undefined> {
    const order = await db.getOrderByNumber(orderNumber);
    if (!order) return undefined;
    
    const items = await db.getOrderItems(order.orderId);
    return { order, items };
  }

  /**
   * Get orders by restaurant
   */
  async getOrdersByRestaurant(restaurantId: number): Promise<Order[]> {
    return await db.getOrdersByRestaurant(restaurantId);
  }

  /**
   * Get orders by status
   */
  async getOrdersByStatus(status: Order['orderStatus']): Promise<Order[]> {
    return await db.getOrdersByStatus(status);
  }

  /**
   * Get all orders
   */
  async getAllOrders(): Promise<Order[]> {
    return await db.getAllOrders();
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: number, status: Order['orderStatus']): Promise<void> {
    await db.updateOrderStatus(orderId, status);
    
    // Update queue status if order is completed or cancelled
    if (status === 'delivered' || status === 'cancelled') {
      const queue = await db.getQueuedOrders();
      const orderQueue = queue.find(q => q.orderId === orderId);
      if (orderQueue) {
        await db.updateOrderQueueStatus(orderQueue.queueId, 'completed');
      }
    }
  }

  /**
   * Get queued orders
   */
  async getQueuedOrders(): Promise<OrderQueue[]> {
    return await db.getQueuedOrders();
  }

  /**
   * Process order from queue
   */
  async processOrder(queueId: number, processedBy: string): Promise<void> {
    await db.updateOrderQueueStatus(queueId, 'processing', processedBy);
  }
}

export const orderService = new OrderService();

