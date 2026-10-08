'use client'
import { useState } from 'react'
import { FolderGit2, Code2, AlertTriangle } from 'lucide-react'
import ChatInput from '../components/chatinput'
import CodeViewer from '../components/codeviewer'
import GithubExport from '../components/githubexport'
import VercelDeploy from '../components/verceldeploy' // <-- Naya component import kiya

// Frontend Regex Parser
function parseCodeBlocks(rawText) {
  const files = []
  const regex = /===\s+([^\s]+)\s+===/g
  let match
  let lastIndex = 0
  let currentFile = null

  const matches = [...rawText.matchAll(regex)]

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i]
    if (currentFile) {
      let content = rawText.substring(lastIndex, match.index).trim()
      files.push({ path: currentFile, content })
    }
    currentFile = match[1]
    lastIndex = match.index + match[0].length
  }

  if (currentFile) {
    let content = rawText.substring(lastIndex).trim()
    files.push({ path: currentFile, content })
  }
  return files
}

export default function Home() {
  const [generatedCode, setGeneratedCode] = useState('')
  const [parsedFiles, setParsedFiles] = useState([])
  const [selectedFileIndex, setSelectedFileIndex] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  
  // GitHub States
  const [isExporting, setIsExporting] = useState(false)
  const [repoUrl, setRepoUrl] = useState('')
  
  // Vercel States
  const [isDeploying, setIsDeploying] = useState(false)
  const [liveUrl, setLiveUrl] = useState('')

  const handleGenerate = async (prompt) => {
    setIsGenerating(true)
    setGeneratedCode('')
    setParsedFiles([])
    setSelectedFileIndex(0)
    setRepoUrl('')
    setLiveUrl('') // Naya deploy shuru hote hi purana link hata do

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      if (!response.body) throw new Error('No response body')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let done = false
      let fullText = ''

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        const chunkValue = decoder.decode(value)
        fullText += chunkValue
        setGeneratedCode(fullText)
        
        const updatedFiles = parseCodeBlocks(fullText)
        if (updatedFiles.length > 0) {
          setParsedFiles(updatedFiles)
        }
      }
    } catch (error) {
      console.error("Generation Error:", error)
      setGeneratedCode("// Error: Code generate nahi ho paya. Dobara try karein.")
    } finally {
      setIsGenerating(false)
    }
  }

  // GitHub Backup Function
  const handleExport = async () => {
    if (!generatedCode) return
    setIsExporting(true)
    try {
      const response = await fetch('/api/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: generatedCode }),
      })
      const data = await response.json()
      
      if (data.repoUrl) {
        setRepoUrl(data.repoUrl)
      } else {
        alert("GitHub Push Error: " + data.error)
      }
    } catch (error) {
      console.error("Export Error:", error)
      alert("GitHub par code push nahi ho paya.")
    } finally {
      setIsExporting(false)
    }
  }

  // Naya: Vercel Direct Deploy Function
  const handleVercelDeploy = async () => {
    if (!generatedCode) return
    setIsDeploying(true)
    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: generatedCode }),
      })
      const data = await response.json()
      
      if (data.url) {
        setLiveUrl(data.url)
      } else {
        alert("Vercel Deploy Error: " + data.error)
      }
    } catch (error) {
      console.error("Deploy Error:", error)
      alert("Vercel par deploy nahi ho paya.")
    } finally {
      setIsDeploying(false)
    }
  }

  const selectedFile = parsedFiles[selectedFileIndex]

  return (
    <main className="max-w-[1920px] mx-auto p-4 md:p-6 min-h-screen flex flex-col gap-6 bg-background">
      {/* Premium Split Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-surface rounded-2xl border border-gray-800 shadow-xl">
        <div className="flex items-center gap-3">
          <FolderGit2 className="w-8 h-8 text-primary" />
          <div className="flex flex-col gap-0.5">
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400 uppercase tracking-widest">
              A S Tech <span className="text-white text-xl">Web Builder</span>
            </h1>
            <p className="text-gray-400 text-xs">Full-Stack Split IDE Layout</p>
          </div>
        </div>
        
        {/* Action Buttons (Dono Buttons yahan hain) */}
        {generatedCode && !isGenerating && (
          <div className="flex items-center gap-3 w-full md:w-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
            <GithubExport 
              onExport={handleExport} 
              isExporting={isExporting} 
              repoUrl={repoUrl} 
            />
            <VercelDeploy 
              onDeploy={handleVercelDeploy} 
              isDeploying={isDeploying} 
              liveUrl={liveUrl} 
            />
          </div>
        )}
      </header>

      {/* Modern Split Panels (Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
        {/* Left Sidebar (File Tree) */}
        <aside className="lg:col-span-3 flex flex-col gap-4 bg-surface border border-gray-800 rounded-2xl p-4 overflow-auto min-h-[400px]">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-3 mb-1">
            <FolderGit2 className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-semibold text-gray-200 tracking-wider">PROJECT FILES</h2>
          </div>
          
          {parsedFiles.length > 0 ? (
            <div className="flex flex-col gap-1.5 text-sm">
              {parsedFiles.map((file, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedFileIndex(index)}
                  className={`flex items-center gap-3 w-full p-2 rounded-lg text-left transition-all ${
                    index === selectedFileIndex 
                    ? 'bg-gray-800 text-primary border border-gray-700' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <Code2 className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate font-mono">{file.path}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-600 italic gap-3 p-6">
               {isGenerating ? (
                  <div className="flex flex-col items-center gap-2">
                     <FolderGit2 className="w-10 h-10 animate-pulse" />
                     Gemini files parse kar raha hai...
                  </div>
               ) : (
                  <>
                     <AlertTriangle className="w-10 h-10" />
                     Naya prompt dekar files generate karein...
                  </>
               )}
            </div>
          )}
        </aside>

        {/* Right Main Area (Code Viewer) */}
        <section className="lg:col-span-9 flex flex-col bg-surface border border-gray-800 rounded-2xl overflow-hidden shadow-2xl min-h-[400px]">
          <CodeViewer 
            content={selectedFile ? selectedFile.content : generatedCode} 
            filename={selectedFile ? selectedFile.path : 'Raw Output'}
          />
        </section>
      </div>

      {/* Floating Bottom Chat Panel */}
      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:w-[800px] z-50">
        <ChatInput onSubmit={handleGenerate} isLoading={isGenerating} />
      </footer>
    </main>
  )
}
