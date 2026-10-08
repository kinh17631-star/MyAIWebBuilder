import { GoogleGenerativeAI } from '@google/generative-ai'
import { SYSTEM_PROMPT } from '../../../utils/prompthelper'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  try {
    const { prompt } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Gemini API Key missing' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

    const fullPrompt = `${SYSTEM_PROMPT}\n\nUser Request: ${prompt}`

    // Stream generation so Vercel never times out
    const result = await model.generateContentStream(fullPrompt)

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text()
            controller.enqueue(encoder.encode(chunkText))
          }
        } catch (err) {
          controller.error(err)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    console.error('API Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
