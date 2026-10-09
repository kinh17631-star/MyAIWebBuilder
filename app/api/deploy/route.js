export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { code, projectId } = await req.json();
    const token = process.env.VERCEL_TOKEN;

    if (!token) {
      return new Response(JSON.stringify({ error: 'VERCEL_TOKEN Environment Variables mein nahi mila' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

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
      return new Response(JSON.stringify({ error: 'Code mein koi valid file structure nahi mila' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

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
            "clsx": "^2.1.1",
            "tailwind-merge": "^2.3.0"
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
        data: `/** @type {import('tailwindcss').Config} */
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
}`
      },
      {
        file: 'postcss.config.js',
        data: `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`
      },
      {
        file: 'app/globals.css',
        data: `@tailwind base;
@tailwind components;
@tailwind utilities;`
      }
    ];

    const allFilesMap = new Map();
    defaultTemplates.forEach(f => allFilesMap.set(f.file, f.data));
    files.forEach(f => allFilesMap.set(f.file, f.data));

    const finalFilesArray = Array.from(allFilesMap.entries()).map(([file, data]) => ({
      file,
      data
    }));

    const targetProjectName = projectId || `ai-site-${Date.now().toString().slice(-6)}`;

    const payload = {
      name: targetProjectName,
      files: finalFilesArray,
      projectSettings: {
        framework: 'nextjs'
      }
    };

    if (projectId) {
      payload.project = projectId;
    }

    const vercelRes = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const vercelData = await vercelRes.json();

    if (!vercelRes.ok) {
      console.error('Vercel Deployment Error:', vercelData);
      return new Response(JSON.stringify({ error: vercelData.error?.message || 'Deployment fail ho gayi' }), {
        status: vercelRes.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      message: 'Deployment shuru ho chuki hai!',
      url: `https://${vercelData.url}`,
      deploymentId: vercelData.id,
      projectId: vercelData.projectId || targetProjectName
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
