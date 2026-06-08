import { NextRequest } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');

  if (!orderId) {
    return new Response('Missing orderId', { status: 400 });
  }

  const responseHeaders = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
  };

  // We check if the order exists first
  const orderCheck = await db.order.findUnique({ where: { id: orderId } });
  if (!orderCheck) {
    return new Response('Order not found', { status: 404 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const sendUpdate = async () => {
        try {
          const order = await db.order.findUnique({
            where: { id: orderId },
            select: {
              id: true,
              status: true,
              estimatedWaitTime: true,
              tokenNumber: true,
              paymentStatus: true
            }
          });
          if (order) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(order)}\n\n`));
          }
        } catch {
          console.error('SSE sendUpdate error:');
        }
      };

      // Send initial status immediately
      await sendUpdate();

      // Poll database every 2 seconds for real-time responsiveness
      const interval = setInterval(async () => {
        await sendUpdate();
      }, 2000);

      // Listen for connection close
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        try {
          controller.close();
        } catch {
          // Stream might be closed already
        }
      });
    }
  });

  return new Response(stream, { headers: responseHeaders });
}
