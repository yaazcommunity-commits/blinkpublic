import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, model, messages, stream = false, parameters = {} } = body;

    if (!provider || !model || !messages) {
      return NextResponse.json(
        { error: 'Missing required fields: provider, model, messages' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { LLMClient } = require('@rocketnew/llm-sdk');
    const client = new LLMClient({ gemini: apiKey });

    if (stream) {
      const encoder = new TextEncoder();

      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            controller.enqueue(encoder.encode('data: {"type":"start"}\n\n'));

            const streamResponse = await client.chat.completions.create({
              provider,
              model,
              messages,
              stream: true,
              ...parameters,
            });

            for await (const chunk of streamResponse) {
              const data = JSON.stringify({ type: 'chunk', chunk });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }

            controller.enqueue(encoder.encode('data: {"type":"done"}\n\n'));
            controller.close();
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Stream error';
            const errorData = JSON.stringify({ type: 'error', error: errorMessage });
            controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
            controller.close();
          }
        },
      });

      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    } else {
      const response = await client.chat.completions.create({
        provider,
        model,
        messages,
        stream: false,
        ...parameters,
      });

      return NextResponse.json(response);
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Internal server error';
    console.error('Chat completion error:', errorMessage);
    return NextResponse.json(
      { error: errorMessage, details: errorMessage },
      { status: 500 }
    );
  }
}
