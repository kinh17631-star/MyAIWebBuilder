import { GoogleGenerativeAI } from '@google/generative-ai'
import { SYSTEM_PROMPT } from '../../../utils/prompthelper'

export const dynamic = 'force-dynamic'
// Vercel Hobby plan maximum duration ko 60 seconds set karna zaroori hai (streaming hatane ke baad)
export const maxDuration = 60 

export async function POST(req) {
  try {
    // 1. UPDATE: 'existingCode' receive karein taaki purani website yaad rahe
    const { prompt, existingCode } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Gemini API Key missing' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // 2. CONTEXT MEMORY LOOP: AI ko batayein ki modify karna hai ya naya banana hai
    let fullPrompt = SYSTEM_PROMPT
    if (existingCode && existingCode.length > 10) {
      fullPrompt += `\n\nCURRENT WEBSITE CODE:\n${existingCode}\n\nUSER MODIFICATION REQUEST: ${prompt}\n\nIMPORTANT: Do not create a new site. Update the provided code based on the request. Output the FULL updated files.`
    } else {
      fullPrompt += `\n\nUSER REQUEST: ${prompt}`
    }

    // 3. MASTER VALIDATOR (No Streaming): Poora response pehle collect karein
    const result = await model.generateContent(fullPrompt)
    let rawText = result.response.text()

    // JUNK REMOVER: Faltu Markdown aur AI chat saaf karein
    rawText = rawText.replace(/```[a-zA-Z]*\n/g, '').replace(/```/g, '')

    // EXTRACTOR: Sirf === filepath === wale blocks nikalna
    const fileRegex = /===\s*(.+?)\s*===[\s\S]*?(?====|$)/g;
    let match;
    const validatedFiles = [];
    
    while ((match = fileRegex.exec(rawText)) !== null) {
      const filePath = match[1].trim();
      let fileContent = match[0].replace(/===\s*(.+?)\s*===/, '').trim();
      
      // COMPLETENESS CHECK: Ensure curly braces match (fixes Token limit cut-offs)
      const openBraces = (fileContent.match(/\{/g) || []).length;
      const closeBraces = (fileContent.match(/\}/g) || []).length;
      
      if (openBraces > closeBraces) {
        // Auto-fix missing closing tags
        const missingCount = openBraces - closeBraces;
        fileContent += '\n' + '}'.repeat(missingCount) + ' // Auto-fixed by MyAIWebBuilder Validator';
      }

      validatedFiles.push({
        path: filePath,
        content: fileContent
      });
    }

    // Failsafe: Agar AI format bhool gayi
    if (validatedFiles.length === 0) {
      throw new Error("AI failed to output strictly formatted files. Please try the prompt again.");
    }

    // Clean JSON files bhejein frontend ko
    return new Response(JSON.stringify({ files: validatedFiles }), {
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('API Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
