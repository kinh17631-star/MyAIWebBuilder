export async function POST(req) {
  try {
    const { code } = await req.json();
    const token = process.env.VERCEL_TOKEN;

    if (!token) {
      return new Response(JSON.stringify({ error: 'VERCEL_TOKEN Environment Variables mein nahi mila' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 1. Generated code ko files mein todna (Parser)
    const files = [];
    const regex = /===\s+([^\s]+)\s+===/g;
    let match;
    let lastIndex = 0;
    let currentFile = null;

    const matches = [...code.matchAll(regex)];

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      if (currentFile) {
        let content = code.substring(lastIndex, match.index).trim();
        content = content.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '');
        files.push({ file: currentFile, data: content });
      }
      currentFile = match[1];
      lastIndex = match.index + match[0].length;
    }

    if (currentFile) {
      let content = code.substring(lastIndex).trim();
      content = content.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '');
      files.push({ file: currentFile, data: content });
    }

    if (files.length === 0) {
      return new Response(JSON.stringify({ error: 'Code mein koi valid file structure nahi mila' }), { status: 400 });
    }

    // 2. Vercel ke liye default Next.js Configuration Files
    const defaultTemplates = [
      {
        file: 'package.json',
        data: JSON.stringify({
          name: "ai-generated-site",
          version: "0.1.0",
          private: true,
          scripts: {
            "dev": "next dev",
            "build": "next build",
            "start": "next start"
          },
          dependencies: {
            "react": "^18.2.0",
            "react-dom": "^18.2.0",
            "next": "^14.2.0",
            "lucide-react": "^0.378.0",
            "framer-motion": "^11.1.7",
            "clsx": "^2.1.1",           // Naya AI tool add ho gaya
            "tailwind-merge": "^2.3.0"  // Naya AI tool add ho gaya
          },
          devDependencies: {
            "tailwindcss": "^3.4.3",
            "postcss": "^8.4.38",
            "autoprefixer": "^10.4.19"
          }
        }, null, 2)
      },
      {
        file: 'tailwind.config.js',
        data: `
          /** @type {import('tailwindcss').Config} */
          module.exports = {
            content: [
              "./app/**/*.{js,ts,jsx,tsx}",
              "./components/**/*.{js,ts,jsx,tsx}",
              "./lib/**/*.{js,ts,jsx,tsx}",
            ],
            theme: {
              extend: {},
            },
            plugins: [],
          }
        `
      },
      {
        file: 'postcss.config.js',
        data: `
          module.exports = {
            plugins: {
              tailwindcss: {},
              autoprefixer: {},
            },
          }
        `
      },
      {
        file: 'app/globals.css',
        data: `
          @tailwind base;
          @tailwind components;
          @tailwind utilities;
          body { background-color: #0c0f17; color: #ffffff; }
        `
      },
      {
        file: 'app/layout.js',
        data: `
          import './globals.css'
          export default function RootLayout({ children }) {
            return (
              <html lang="en">
                <body>{children}</body>
              </html>
            )
          }
        `
      }
    ];

    // Default files aur AI files ko ek saath milana
    const allFilesMap = new Map();
    defaultTemplates.forEach(f => allFilesMap.set(f.file, f.data));
    files.forEach(f => allFilesMap.set(f.file, f.data));

    const finalFilesArray = Array.from(allFilesMap.entries()).map(([file, data]) => ({
      file,
      data
    }));

    // 3. Vercel REST API ko direct call karna
    const vercelRes = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'ai-web-builder-site',
        files: finalFilesArray,
        projectSettings: {
          framework: 'nextjs'
        }
      })
    });

    const vercelData = await vercelRes.json();

    if (!vercelRes.ok) {
      console.error('Vercel Deployment Error:', vercelData);
      return new Response(JSON.stringify({ error: vercelData.error?.message || 'Deployment fail ho gayi' }), { status: vercelRes.status });
    }

    return new Response(JSON.stringify({
      message: 'Deployment shuru ho chuki hai!',
      url: `https://${vercelData.url}`,
      deploymentId: vercelData.id
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Direct Deploy Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
