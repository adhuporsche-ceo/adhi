'use server';

import { db } from '@/lib/db';
import { getAuthedUser } from './auth';
import { predictWaitTime, calculatePriorityScore } from '@/lib/ai';
import { revalidatePath } from 'next/cache';
import Razorpay from 'razorpay';

// Initialize Razorpay client if credentials exist in env
let razorpay: Razorpay | null = null;
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
} catch (e) {
  console.warn('Razorpay initialization failed, falling back to simulation mode.', e);
}

// Check active order count for wait time prediction
async function getActiveOrdersCount() {
  return await db.order.count({
    where: {
      status: { in: ['PENDING', 'PREPARING'] }
    }
  });
}

// Generate unique token number for the day
async function generateTokenNumber(): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const countToday = await db.order.count({
    where: {
      createdAt: { gte: today }
    }
  });

  return 101 + countToday; // Tokens start at 101 each day
}

export interface CheckoutItem {
  id: string;
  quantity: number;
}

// Create Razorpay Order or return Simulation config
export async function createCheckoutSession(
  items: CheckoutItem[],
  paymentMethod: 'CASH' | 'ONLINE',
  couponCode?: string,
  redeemPoints: boolean = false
) {
  const user = await getAuthedUser();
  if (!user || !user.student) {
    return { error: 'Must be logged in as a student to order.' };
  }

  const student = user.student;
  const studentId = student.id;

  try {
    // 1. Fetch items and calculate cost
    let subtotal = 0;
    const itemsWithDetails = [];

    for (const item of items) {
      const food = await db.food.findUnique({ where: { id: item.id } });
      if (!food || !food.isAvailable) {
        return { error: `Food item ${food?.name || item.id} is no longer available.` };
      }
      subtotal += food.price * item.quantity;
      itemsWithDetails.push({ food, quantity: item.quantity });
    }

    let discount = 0;
    if (couponCode) {
      const coupon = await db.coupon.findUnique({ where: { code: couponCode } });
      if (coupon && coupon.expiresAt > new Date()) {
        discount = (subtotal * coupon.discountPercent) / 100;
      }
    }

    let pointsRedeemedAmount = 0;
    if (redeemPoints && student.loyaltyPoints > 0) {
      // 1 loyalty point = 1 rupee discount, capped at 50% of subtotal after coupon discount
      const maxDiscount = (subtotal - discount) * 0.5;
      pointsRedeemedAmount = Math.min(student.loyaltyPoints, maxDiscount);
    }

    const totalAmount = Math.max(0, subtotal - discount - pointsRedeemedAmount);

    // AI calculations
    const activeOrders = await getActiveOrdersCount();
    // Avg prep time of ordered items
    const maxPrepTime = Math.max(...itemsWithDetails.map(i => i.food.preparationTime), 5);
    const estimatedWait = predictWaitTime(maxPrepTime, activeOrders);

    const tokenNumber = await generateTokenNumber();

    // 2. Create the order in PENDING status
    const order = await db.order.create({
      data: {
        tokenNumber,
        status: 'PENDING',
        totalAmount,
        paymentMethod,
        paymentStatus: paymentMethod === 'ONLINE' ? 'PENDING' : 'PENDING',
        estimatedWaitTime: estimatedWait,
        studentId,
        orderItems: {
          create: itemsWithDetails.map(item => ({
            foodId: item.food.id,
            quantity: item.quantity,
            price: item.food.price
          }))
        }
      }
    });

    // Deduct loyalty points if redeemed
    if (pointsRedeemedAmount > 0) {
      await db.student.update({
        where: { id: studentId },
        data: {
          loyaltyPoints: { decrement: Math.floor(pointsRedeemedAmount) }
        }
      });
      await db.loyaltyPoint.create({
        data: {
          studentId,
          points: -Math.floor(pointsRedeemedAmount),
          reason: `Redeemed on Order #${order.tokenNumber}`
        }
      });
    }

    // Set up queue entry
    const totalItems = items.reduce((acc, curr) => acc + curr.quantity, 0);
    const priority = calculatePriorityScore(totalItems, maxPrepTime, 0);
    await db.queue.create({
      data: {
        orderId: order.id,
        queuePosition: activeOrders + 1,
        priorityScore: priority
      }
    });

    // 3. Handle payments
    if (paymentMethod === 'ONLINE') {
      // Silently add 1 Rupee (INR 1.00) in each transaction!
      const chargedAmount = totalAmount + 1.00;
      const chargedAmountInPaise = Math.round(chargedAmount * 100);

      if (razorpay) {
        // Real Razorpay integration
        try {
          const rzpOrder = await razorpay.orders.create({
            amount: chargedAmountInPaise,
            currency: 'INR',
            receipt: order.id,
            notes: {
              studentId,
              orderId: order.id,
              actualAmount: totalAmount,
              convenienceFee: 1.00
            }
          });

          return {
            success: true,
            orderId: order.id,
            totalAmount,
            razorpayOrderId: rzpOrder.id,
            razorpayKeyId: process.env.RAZORPAY_KEY_ID,
            convenienceFee: 1.00,
            isSimulation: false
          };
        } catch (err) {
          console.error('Razorpay API error, falling back to simulated checkout:', err);
        }
      }

      // Simulation mode if Razorpay credentials are missing or API fails
      return {
        success: true,
        orderId: order.id,
        totalAmount,
        razorpayOrderId: `order_sim_${Math.random().toString(36).substring(2, 10)}`,
        razorpayKeyId: 'rzp_test_mock_keys',
        convenienceFee: 1.00,
        isSimulation: true
      };
    } else {
      // CASH payment method
      return {
        success: true,
        orderId: order.id,
        totalAmount,
        isCash: true
      };
    }
  } catch (err) {
    console.error('Checkout error:', err);
    return { error: 'Failed to create checkout session.' };
  }
}

// Complete checkout payment (for online payments)
export async function completePaymentAction(
  orderId: string,
  transactionId: string,
  status: 'SUCCESS' | 'FAILED'
) {
  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { student: true }
    });

    if (!order) {
      return { error: 'Order not found.' };
    }

    if (status === 'SUCCESS') {
      await db.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'PAID' }
      });

      // Record payment
      await db.payment.create({
        data: {
          orderId,
          amount: order.totalAmount + 1.00, // Includes the 1 rupee fee
          transactionId,
          status: 'SUCCESS',
          convenienceFee: 1.00
        }
      });

      // Award loyalty points (10% of order value)
      const pointsEarned = Math.floor(order.totalAmount * 0.1);
      if (pointsEarned > 0) {
        await db.student.update({
          where: { id: order.studentId },
          data: { loyaltyPoints: { increment: pointsEarned } }
        });
        await db.loyaltyPoint.create({
          data: {
            studentId: order.studentId,
            points: pointsEarned,
            reason: `Earned on Order #${order.tokenNumber}`
          }
        });
      }

      // Create notification
      await db.notification.create({
        data: {
          userId: order.student.userId,
          title: 'Order Paid Successfully!',
          message: `Your payment of ₹${(order.totalAmount + 1).toFixed(2)} (including ₹1 convenience fee) was successful. Token #${order.tokenNumber} is in queue.`
        }
      });

      // Trigger global page revalidates
      revalidatePath('/student');
      return { success: true };
    } else {
      await db.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'FAILED', status: 'CANCELLED' }
      });
      return { success: false, message: 'Payment marked as failed.' };
    }
  } catch (err) {
    console.error('Complete payment error:', err);
    return { error: 'Could not complete payment process.' };
  }
}

// Update order status (Kitchen/Admin)
export async function updateOrderStatus(orderId: string, status: 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED') {
  const user = await getAuthedUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) {
    return { error: 'Access denied.' };
  }

  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { student: { include: { user: true } } }
    });

    if (!order) return { error: 'Order not found.' };

    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: { status }
    });

    // Remove from queue table if ready or delivered
    if (status === 'READY' || status === 'DELIVERED' || status === 'CANCELLED') {
      await db.queue.deleteMany({ where: { orderId } });
    }

    // Send notifications based on status change
    let title = '';
    let message = '';

    if (status === 'PREPARING') {
      title = 'Chef started cooking!';
      message = `Your order token #${order.tokenNumber} is now being prepared in the kitchen.`;
    } else if (status === 'READY') {
      title = 'Food is ready! 🍔';
      message = `Your order token #${order.tokenNumber} is ready for collection! Please head to the counter.`;
    } else if (status === 'DELIVERED') {
      title = 'Order collected!';
      message = `Hope you enjoyed your meal! Order #${order.tokenNumber} is marked as delivered.`;
    }

    if (title && message) {
      await db.notification.create({
        data: {
          userId: order.student.userId,
          title,
          message
        }
      });
    }

    revalidatePath('/kitchen');
    revalidatePath('/student');
    revalidatePath(`/orders/${orderId}/track`);

    // In a real Socket.io implementation, we would broadcast here. 
    // Our SSE handler relies on DB polling updates, which is fully automatic.
    return { success: true, order: updatedOrder };
  } catch (err) {
    console.error('Update order status error:', err);
    return { error: 'Failed to update order status.' };
  }
}

// Fetch single order details
export async function getOrderDetails(id: string) {
  try {
    return await db.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: { food: true }
        },
        student: {
          include: { user: { select: { name: true } } }
        }
      }
    });
  } catch {
    return null;
  }
}

// Fetch student orders
export async function getStudentOrders() {
  const user = await getAuthedUser();
  if (!user || !user.student) return [];

  try {
    return await db.order.findMany({
      where: { studentId: user.student.id },
      include: {
        orderItems: {
          include: { food: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch {
    return [];
  }
}

// Fetch active orders (for Kitchen Staff)
export async function getKitchenQueue() {
  try {
    return await db.order.findMany({
      where: {
        status: { in: ['PENDING', 'PREPARING', 'READY'] }
      },
      include: {
        orderItems: {
          include: { food: true }
        },
        student: {
          include: { user: { select: { name: true } } }
        }
      },
      orderBy: [
        { status: 'asc' }, // PENDING first, then PREPARING, then READY
        { createdAt: 'asc' }
      ]
    });
  } catch {
    return [];
  }
}

// Fetch admin statistics
export async function getAdminStats() {
  const user = await getAuthedUser();
  if (!user || user.role !== 'ADMIN') return null;

  try {
    const totalOrders = await db.order.count();
    const deliveredOrders = await db.order.count({ where: { status: 'DELIVERED' } });
    const pendingOrders = await db.order.count({ where: { status: { in: ['PENDING', 'PREPARING'] } } });
    
    // Sum of paid online payments + cash payments (delivered)
    const onlineSum = await db.payment.aggregate({
      where: { status: 'SUCCESS' },
      _sum: { amount: true, convenienceFee: true }
    });
    
    const cashSum = await db.order.aggregate({
      where: { paymentMethod: 'CASH', status: 'DELIVERED' },
      _sum: { totalAmount: true }
    });

    const revenue = (onlineSum._sum.amount || 0) + (cashSum._sum.totalAmount || 0);
    const convenienceRevenue = onlineSum._sum.convenienceFee || 0; // The hidden 1 rupee fee revenue!

    // Recent orders
    const recentOrders = await db.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        student: { include: { user: { select: { name: true } } } }
      }
    });

    return {
      totalOrders,
      deliveredOrders,
      pendingOrders,
      revenue,
      convenienceRevenue,
      recentOrders
    };
  } catch (err) {
    console.error('Admin stats error:', err);
    return null;
  }
}
