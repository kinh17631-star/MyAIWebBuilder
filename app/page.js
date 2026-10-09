'use client'
import { useState } from 'react'
import { FolderGit2, Code2, AlertTriangle, RefreshCw, Rocket } from 'lucide-react'
import ChatInput from '../components/chatinput'
import CodeViewer from '../components/codeviewer'
import GithubExport from '../components/githubexport'
import VercelDeploy from '../components/verceldeploy'

export default function Home() {
  const [generatedCode, setGeneratedCode] = useState('')
  const [parsedFiles, setParsedFiles] = useState([])
  const [selectedFileIndex, setSelectedFileIndex] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Persistent Session States
  const [projectId, setProjectId] = useState(null) // Purana session ID
  const [repoUrl, setRepoUrl] = useState('')
  const [liveUrl, setLiveUrl] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)

  // Session Reset Function
  const handleResetSession = () => {
    setGeneratedCode('')
    setParsedFiles([])
    setSelectedFileIndex(0)
    setProjectId(null)
    setRepoUrl('')
    setLiveUrl('')
    alert("Session successfully reset! Aap bilkul fresh prompt de sakte hain.")
  }

  const handleGenerate = async (prompt) => {
    // 1. Agar user ne 'reset' command diya hai
    if (prompt.trim().toLowerCase() === 'reset') {
      handleResetSession()
      return
    }

    setIsGenerating(true)

    try {
      // Memory: Session ka purana code aur projectId dono backend ko jayenge
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt,
          existingCode: generatedCode || '' 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate code')
      }

      if (data.files && Array.isArray(data.files)) {
        setParsedFiles(data.files)
        setSelectedFileIndex(0)

        const rawFullText = data.files
          .map((f) => `=== ${f.path} ===\n${f.content}`)
          .join('\n\n')
        setGeneratedCode(rawFullText)
      } else {
        throw new Error('Invalid file structure received from AI')
      }
    } catch (error) {
      console.error("Generation Error:", error)
      setGeneratedCode(`// Error: ${error.message}. Dobara try karein.`)
    } finally {
      setIsGenerating(false)
    }
  }

  // GitHub Export / Update Function
  const handleExport = async () => {
    if (!generatedCode) return
    setIsExporting(true)
    try {
      const response = await fetch('/api/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: generatedCode,
          projectId: projectId 
        }),
      })
      const data = await response.json()
      
      if (data.repoUrl) {
        setRepoUrl(data.repoUrl)
        if (data.projectId) setProjectId(data.projectId)
      } else {
        alert("GitHub Error: " + data.error)
      }
    } catch (error) {
      console.error("Export Error:", error)
      alert("GitHub par push nahi ho paya.")
    } finally {
      setIsExporting(false)
    }
  }

  // Vercel Deploy / Re-Deploy Function
  const handleVercelDeploy = async () => {
    if (!generatedCode) return
    setIsDeploying(true)
    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: generatedCode,
          projectId: projectId // Agar exist karta hai toh usi project par redeploy hoga
        }),
      })
      const data = await response.json()
      
      if (data.url) {
        setLiveUrl(data.url)
        if (data.projectId) setProjectId(data.projectId) // Session ID lock kar li
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
      {/* Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-surface rounded-2xl border border-gray-800 shadow-xl">
        <div className="flex items-center gap-3">
          <FolderGit2 className="w-8 h-8 text-primary" />
          <div className="flex flex-col gap-0.5">
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400 uppercase tracking-widest">
              MyAIWebBuilder
            </h1>
            <p className="text-gray-400 text-xs">
              {projectId ? `Active Session: [${projectId}]` : 'Error-Free Multi-Page Engine'}
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        {generatedCode && !isGenerating && (
          <div className="flex items-center gap-3 w-full md:w-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Manual Reset Button */}
            <button
              onClick={handleResetSession}
              className="px-3 py-2 text-xs font-semibold text-gray-400 hover:text-red-400 bg-gray-900 border border-gray-800 hover:border-red-500/40 rounded-xl transition-all flex items-center gap-1.5"
              title="Type 'reset' in chat or click here"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Project
            </button>

            <GithubExport 
              onExport={handleExport} 
              isExporting={isExporting} 
              repoUrl={repoUrl} 
            />
            
            {/* Deploy / Re-Deploy Smart Button */}
            <button
              onClick={handleVercelDeploy}
              disabled={isDeploying}
              className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <Rocket className={`w-4 h-4 ${isDeploying ? 'animate-spin' : ''}`} />
              {isDeploying 
                ? 'Processing...' 
                : projectId 
                  ? '🔄 Re-Deploy Changes' 
                  : '🚀 Deploy to Vercel'}
            </button>

            {liveUrl && (
              <a
                href={liveUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 text-xs font-bold text-green-400 bg-green-950/40 border border-green-800 rounded-xl hover:bg-green-900/60 transition-all"
              >
                Open Live Site ↗
              </a>
            )}
          </div>
        )}
      </header>

      {/* Grid Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
        {/* File Tree */}
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
                     <FolderGit2 className="w-10 h-10 animate-pulse text-primary" />
                     {projectId ? 'Updating existing project...' : 'Generating files...'}
                  </div>
               ) : (
                  <>
                     <AlertTriangle className="w-10 h-10" />
                     Naya prompt dekar website banayein...
                  </>
               )}
            </div>
          )}
        </aside>

        {/* Code Viewer */}
        <section className="lg:col-span-9 flex flex-col bg-surface border border-gray-800 rounded-2xl overflow-hidden shadow-2xl min-h-[400px]">
          <CodeViewer 
            content={selectedFile ? selectedFile.content : generatedCode} 
            filename={selectedFile ? selectedFile.path : 'Raw Output'}
          />
        </section>
      </div>

      {/* Floating Chat Input */}
      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:w-[800px] z-50">
        <ChatInput 
          onSubmit={handleGenerate} 
          isLoading={isGenerating} 
          placeholder={projectId ? "Changes prompt karein, ya 'reset' likhein..." : "Kaisi website banani hai?..."}
        />
      </footer>
    </main>
  )
}
