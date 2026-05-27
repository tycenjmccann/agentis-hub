import { NextRequest, NextResponse } from 'next/server';

interface TransitionRequest {
  ticketId: string;
  fromStatus: string;
  toStatus: string;
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['in_progress', 'cancelled'],
  in_progress: ['review', 'blocked', 'cancelled'],
  review: ['done', 'in_progress', 'cancelled'],
  blocked: ['in_progress', 'cancelled'],
  done: [],
  failed: ['pending', 'cancelled'],
  queued: ['pending', 'cancelled'],
  cancelled: [],
};

async function getTicketsForWorkflowFromDynamo(workflowId: string): Promise<Record<string, any>[]> {
  // Placeholder for DynamoDB integration
  return [];
}

async function updateTicketStatusInDynamo(
  workflowId: string,
  ticketId: string,
  newStatus: string
): Promise<void> {
  // Placeholder for DynamoDB integration
}

function broadcastTicketUpdate(workflowId: string, ticketId: string, status: string): void {
  // Placeholder for SSE broadcast
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workflowId = params.id;
    const body: TransitionRequest = await request.json();
    const { ticketId, fromStatus, toStatus } = body;

    if (!ticketId || !fromStatus || !toStatus) {
      return NextResponse.json(
        { error: 'Missing required fields: ticketId, fromStatus, toStatus' },
        { status: 400 }
      );
    }

    const tickets = await getTicketsForWorkflowFromDynamo(workflowId);
    const ticket = tickets.find((t: any) => t.ticketId === ticketId);

    if (!ticket) {
      return NextResponse.json(
        { error: `Ticket ${ticketId} not found in workflow ${workflowId}` },
        { status: 404 }
      );
    }

    if (ticket.status !== fromStatus) {
      return NextResponse.json(
        { error: `Ticket status mismatch: expected ${fromStatus}, got ${ticket.status}` },
        { status: 409 }
      );
    }

    const allowedTransitions = VALID_TRANSITIONS[fromStatus] || [];
    if (!allowedTransitions.includes(toStatus)) {
      return NextResponse.json(
        { error: `Invalid transition from ${fromStatus} to ${toStatus}` },
        { status: 422 }
      );
    }

    await updateTicketStatusInDynamo(workflowId, ticketId, toStatus);
    broadcastTicketUpdate(workflowId, ticketId, toStatus);

    return NextResponse.json({
      ticketId,
      workflowId,
      previousStatus: fromStatus,
      currentStatus: toStatus,
      transitionedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
