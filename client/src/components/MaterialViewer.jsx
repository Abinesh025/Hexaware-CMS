import { useState, useEffect, useRef } from 'react'
import {
  File, Download, X, Play, Pause, BookOpen, Video, Mic,
  Loader, ExternalLink, AlertTriangle, Image, FileText
} from 'lucide-react'
import { renderAsync } from 'docx-preview'
import toast from 'react-hot-toast'
import api from '../services/api'

// ── Type metadata for the header badge ───────────────────────────────────────
const typeConfig = {
  notes: { icon: BookOpen, color: 'tag-lime',  label: 'Notes' },
  video: { icon: Video,    color: 'tag-sky',   label: 'Video' },
  voice: { icon: Mic,      color: 'tag-amber', label: 'Voice' },
  file:  { icon: File,     color: 'tag-red',   label: 'File'  },
  pdf:   { icon: FileText, color: 'tag-lime',  label: 'PDF'   },
  image: { icon: Image,    color: 'tag-sky',   label: 'Image' },
}

// ── Derive the real kind of file from the URL extension ──────────────────────
// dbType is the 'type' or 'fileType' field stored in MongoDB — used as fallback
// when Cloudinary omits the file extension from the URL.
function detectKindFromUrl(url = '', dbType = '') {
  // Strip query strings and get the last segment
  const clean = url.split('?')[0].toLowerCase()
  const ext   = clean.split('.').pop()

  // Extension-based detection (most reliable)
  if (ext && ext.length <= 5) {
    if (['pdf'].includes(ext))                                    return 'pdf'
    if (['mp4', 'webm', 'mov', 'avi'].includes(ext))             return 'video'
    if (['mp3', 'wav', 'aac', 'm4a'].includes(ext))              return 'audio'
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return 'image'
    if (['docx', 'doc'].includes(ext))                           return 'word'
    if (['txt', 'md', 'csv'].includes(ext))                      return 'text'
  }

  // Fallback to DB type when the URL has no recognisable extension
  switch (dbType) {
    case 'pdf':   return 'pdf'
    case 'notes': return 'pdf'   // staff usually upload PDFs as "notes"
    case 'video': return 'video'
    case 'voice': return 'audio'
    case 'image': return 'image'
    case 'file':  return 'unknown'
    default:      return 'unknown'
  }
}

// ── Pick correct download API endpoint based on current page ─────────────────
function getDownloadApiUrl(id) {
  const isAdmin = window.location.pathname.startsWith('/admin')
  return isAdmin
    ? `/api/admin/materials/download/${id}`
    : `/api/materials/download/${id}`
}

export default function MaterialViewer({ material, onClose }) {
  // ── Preview blob (PDF / image / text) ───────────────────────────────────
  const [previewBlobUrl, setPreviewBlobUrl] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError,   setPreviewError]   = useState(null)
  const blobUrlRef = useRef(null)

  // ── Audio player ─────────────────────────────────────────────────────────
  const [isPlaying,     setIsPlaying]     = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [audioElement,  setAudioElement]  = useState(null)

  // ── Word doc ─────────────────────────────────────────────────────────────
  const wordContainerRef = useRef(null)
  const [wordLoading, setWordLoading] = useState(false)
  const [wordError,   setWordError]   = useState(null)

  // Determine the stored "type" for the header badge
  const sType    = material?.fileType || material?.type || 'file'
  const fileUrl  = material?.fileUrl  || ''

  // Detect the real file kind from the URL (not from the DB field)
  // Pass dbType as fallback for Cloudinary URLs that lack an extension
  const kind = detectKindFromUrl(fileUrl, sType)

  // MIME type to force on blobs when the response header says octet-stream
  const FORCED_MIME = {
    pdf: 'application/pdf',
    image: 'image/jpeg',
    text: 'text/plain',
    video: 'video/mp4',
    audio: 'audio/mpeg',
  }

  // Compute the public URL (for video <source>, audio <source>, external link)
  const getBackendUrl = (url) => {
    if (!url || url === 'undefined' || url.includes('/undefined')) return ''
    if (url.startsWith('http')) return url
    let base = import.meta.env.VITE_API_URL || ''
    if (base.endsWith('/api')) base = base.slice(0, -4)
    return `${base}${url.startsWith('/') ? '' : '/'}${url}`
  }
  const fileUrlFull = getBackendUrl(fileUrl)

  // ── Blob fetch for PDF / image / text preview ────────────────────────────
  useEffect(() => {
    // Revoke old blob
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
    }
    setPreviewBlobUrl(null)
    setPreviewError(null)

    const needsBlob = ['pdf', 'image', 'text', 'unknown'].includes(kind)
    if (!needsBlob || !material?._id) return

    setPreviewLoading(true)
    const url = getDownloadApiUrl(material._id) + '?inline=1'
    api.get(url, { responseType: 'blob' })
      .then((res) => {
        // The backend now sends the right MIME, but in case it's still
        // application/octet-stream (Cloudinary raw), override with the known kind.
        const serverMime = res.headers['content-type'] || ''
        const forcedMime = FORCED_MIME[kind]
        const mime = (!serverMime || serverMime === 'application/octet-stream') && forcedMime
          ? forcedMime
          : serverMime || 'application/octet-stream'
        const blob = new Blob([res.data], { type: mime })
        const objectUrl = URL.createObjectURL(blob)
        blobUrlRef.current = objectUrl
        setPreviewBlobUrl(objectUrl)
      })
      .catch(() => setPreviewError('Could not load preview. You can still download the file.'))
      .finally(() => setPreviewLoading(false))

    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
        blobUrlRef.current = null
      }
    }
  }, [material?._id, kind])

  // ── Word doc preview via docx-preview ────────────────────────────────────
  useEffect(() => {
    if (kind !== 'word' || !material?._id) return
    setWordLoading(true)
    setWordError(null)
    const url = getDownloadApiUrl(material._id) + '?inline=1'
    api.get(url, { responseType: 'blob' })
      .then((res) =>
        renderAsync(res.data, wordContainerRef.current, undefined, {
          className: 'docx-render', inWrapper: true, breakPages: true, debug: false,
        })
      )
      .then(() => setWordLoading(false))
      .catch((err) => {
        setWordError(err.message || 'Failed to render document')
        setWordLoading(false)
      })
  }, [material?._id, kind])

  // ── Audio player setup ────────────────────────────────────────────────────
  useEffect(() => {
    if ((kind !== 'audio' && sType !== 'voice') || !fileUrlFull) {
      // If conditions are not met, ensure audio element is reset/stopped
      if (audioElement) {
        audioElement.pause()
        setAudioElement(null)
        setIsPlaying(false)
        setAudioProgress(0)
        setAudioDuration(0)
      }
      return
    }

    const audio = new Audio(fileUrlFull)
    const onMeta  = () => { setAudioDuration(audio.duration); setAudioProgress(audio.currentTime) }
    const onTime  = () => setAudioProgress(audio.currentTime)
    const onEnded = () => setIsPlaying(false)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('ended', onEnded)
    setAudioElement(audio)
    return () => {
      audio.pause()
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('ended', onEnded)
    }
  }, [material?._id, kind, sType, fileUrlFull]) // Added fileUrlFull to dependencies

  // ── Guard: must be AFTER all hooks ───────────────────────────────────────
  if (!material) return null

  // ── Download handler ──────────────────────────────────────────────────────
  const handleDownload = async () => {
    if (!material?._id) return
    try {
      toast.loading('Starting download…', { id: 'dl' })
      const res = await api.get(getDownloadApiUrl(material._id), { responseType: 'blob' })
      const mime = res.headers['content-type'] || res.data.type
      const blob = new Blob([res.data], { type: mime })
      const objUrl = window.URL.createObjectURL(blob)
      const link   = document.createElement('a')
      link.href = objUrl
      const cd    = res.headers['content-disposition'] || ''
      const match = cd.match(/filename="?([^"]+)"?/)
      link.download = match ? match[1] : (material.title || 'download')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(objUrl)
      toast.success('Download complete', { id: 'dl' })
    } catch (err) {
      console.error(err)
      toast.error('Download failed. Opening in new tab…', { id: 'dl' })
      window.open(fileUrlFull, '_blank')
    }
  }

  // ── Audio controls ────────────────────────────────────────────────────────
  const togglePlay = () => {
    if (!audioElement) return
    isPlaying ? audioElement.pause() : audioElement.play()
    setIsPlaying(!isPlaying)
  }
  const handleSeek = (e) => {
    const t = Number(e.target.value)
    if (audioElement) audioElement.currentTime = t
    setAudioProgress(t)
  }
  const fmtTime = (s) => {
    if (!s || isNaN(s)) return '0:00'
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
  }

  // ── Determine if it's audio (voice note) ─────────────────────────────────
  const isAudio = kind === 'audio' || sType === 'voice'
  const isVideo = kind === 'video' || sType === 'video'

  const cfg  = typeConfig[sType] || typeConfig.file
  const Icon = cfg.icon

  return (
    <div
      className="fixed inset-0 bg-ink-950/90 backdrop-blur-md flex items-center justify-center z-[100] p-4 sm:p-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`bg-ink-900 border border-ink-800 rounded-2xl flex flex-col overflow-hidden animate-fade-up ${
          isAudio ? 'max-w-md w-full' : 'max-w-5xl w-full max-h-[90vh]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between p-4 border-b border-ink-800 bg-ink-950/50 shrink-0">
          <div className="flex items-center gap-3 truncate pr-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-ink-800`}>
              <Icon size={20} className="text-ink-400" />
            </div>
            <div className="truncate">
              <h3 className="text-ink-50 font-600 truncate">{material.title}</h3>
              <p className="text-ink-500 text-xs truncate capitalize">
                {sType} • {material.uploadedBy?.name || 'Instructor'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {fileUrlFull && (
              <a
                href={fileUrlFull}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost p-2 text-ink-400 hover:text-sky-400"
                title="Open in new tab"
              >
                <ExternalLink size={18} />
              </a>
            )}
            {material._id && (
              <button
                onClick={handleDownload}
                className="btn-ghost p-2 text-ink-400 hover:text-lime-300"
                title="Download"
              >
                <Download size={18} />
              </button>
            )}
            <button
              onClick={onClose}
              className="btn-ghost p-2 text-ink-400 hover:text-red-400"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className={`flex-1 overflow-auto min-h-0 ${isAudio ? 'p-6' : 'p-0 bg-ink-950'}`}>

          {/* No URL at all */}
          {!fileUrlFull ? (
            <div className="p-12 text-center flex flex-col items-center justify-center h-full gap-3">
              <File size={48} className="text-ink-600" />
              <h4 className="text-red-400 font-medium">File not available</h4>
              <p className="text-ink-500 text-sm">The URL for this material is broken or undefined.</p>
            </div>
          ) : (
            <>
              {/* ── PDF preview ── */}
              {kind === 'pdf' && (
                <PreviewPanel
                  loading={previewLoading}
                  error={previewError}
                  blobUrl={previewBlobUrl}
                  title={material.title}
                  onDownload={handleDownload}
                  renderContent={
                    <iframe
                      src={previewBlobUrl}
                      className="w-full h-full border-0 bg-white"
                      title={material.title}
                    />
                  }
                />
              )}

              {/* ── Image preview ── */}
              {kind === 'image' && (
                <PreviewPanel
                  loading={previewLoading}
                  error={previewError}
                  blobUrl={previewBlobUrl}
                  title={material.title}
                  onDownload={handleDownload}
                  renderContent={
                    <div className="flex items-center justify-center w-full h-full p-4">
                      <img
                        src={previewBlobUrl}
                        alt={material.title}
                        className="max-w-full max-h-full object-contain rounded-lg"
                      />
                    </div>
                  }
                />
              )}

              {/* ── Plain-text / CSV / Markdown preview ── */}
              {kind === 'text' && (
                <PreviewPanel
                  loading={previewLoading}
                  error={previewError}
                  blobUrl={previewBlobUrl}
                  title={material.title}
                  onDownload={handleDownload}
                  renderContent={
                    <iframe
                      src={previewBlobUrl}
                      className="w-full h-full border-0 bg-white"
                      title={material.title}
                    />
                  }
                />
              )}

              {/* ── Unknown type — try iframe anyway ── */}
              {kind === 'unknown' && (
                <PreviewPanel
                  loading={previewLoading}
                  error={previewError}
                  blobUrl={previewBlobUrl}
                  title={material.title}
                  onDownload={handleDownload}
                  renderContent={
                    <iframe
                      src={previewBlobUrl}
                      className="w-full h-full border-0 bg-white"
                      title={material.title}
                    />
                  }
                />
              )}

              {/* ── Word doc (docx-preview renders into a div) ── */}
              {kind === 'word' && (
                <div className="w-full h-[60vh] sm:h-[75vh] overflow-auto bg-ink-950 flex flex-col">
                  {wordLoading && (
                    <div className="flex items-center justify-center flex-1 gap-3 text-ink-400">
                      <Loader size={20} className="animate-spin" />
                      <span className="text-sm">Rendering document…</span>
                    </div>
                  )}
                  {wordError && !wordLoading && (
                    <div className="flex flex-col items-center justify-center flex-1 gap-3">
                      <AlertTriangle size={36} className="text-amber-400" />
                      <p className="text-red-400 text-sm">{wordError}</p>
                      <button onClick={handleDownload} className="btn-primary flex items-center gap-2 mt-2">
                        <Download size={14} /> Download Instead
                      </button>
                    </div>
                  )}
                  <div
                    ref={wordContainerRef}
                    className="flex-1 overflow-auto p-4 bg-white"
                    style={{ display: wordLoading || wordError ? 'none' : 'block' }}
                  />
                </div>
              )}

              {/* ── Video player ── */}
              {isVideo && !isAudio && (
                <div className="w-full aspect-video bg-black flex items-center justify-center">
                  <video
                    controls autoPlay
                    className="w-full h-full object-contain"
                    crossOrigin="anonymous"
                  >
                    <source src={fileUrlFull} type="video/mp4" />
                    <source src={fileUrlFull} type="video/webm" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}

              {/* ── Audio / Voice note player ── */}
              {isAudio && (
                <div className="space-y-4">
                  <div className="bg-ink-950 border border-ink-800 rounded-full p-2 flex items-center gap-3">
                    <button
                      onClick={togglePlay}
                      className="w-10 h-10 shrink-0 bg-lime-400 hover:bg-lime-300 rounded-full flex items-center justify-center text-ink-950 transition-colors"
                    >
                      {isPlaying
                        ? <Pause size={18} className="fill-ink-950" />
                        : <Play  size={18} className="fill-ink-950 ml-0.5" />
                      }
                    </button>
                    <div className="flex-1">
                      <input
                        type="range" min="0"
                        max={audioDuration || 100}
                        value={audioProgress}
                        onChange={handleSeek}
                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-lime-400"
                        style={{
                          background: `linear-gradient(to right, #a3e635 ${
                            (audioProgress / (audioDuration || 1)) * 100
                          }%, #2d2d2d ${(audioProgress / (audioDuration || 1)) * 100}%)`,
                        }}
                      />
                    </div>
                    <span className="text-ink-400 text-xs font-mono w-12 text-right pr-2">
                      {fmtTime(audioProgress)}
                    </span>
                  </div>
                  {/* Fallback native audio */}
                  <audio
                    src={fileUrlFull} controls
                    className="w-full h-8 mt-2 opacity-50 hover:opacity-100 transition-opacity"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Shared loading / error / content panel for blob-based previews ────────────
function PreviewPanel({ loading, error, blobUrl, title, onDownload, renderContent }) {
  return (
    <div className="w-full h-[60vh] sm:h-[75vh] flex flex-col">
      {loading && (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 text-ink-400">
          <Loader size={28} className="animate-spin text-lime-400" />
          <span className="text-sm">Loading preview…</span>
        </div>
      )}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center flex-1 gap-4 p-8">
          <AlertTriangle size={40} className="text-amber-400" />
          <p className="text-ink-400 text-sm text-center">{error}</p>
          <button onClick={onDownload} className="btn-primary flex items-center gap-2">
            <Download size={14} /> Download File
          </button>
        </div>
      )}
      {blobUrl && !loading && !error && (
        <div className="flex-1 min-h-0 overflow-hidden">
          {renderContent}
        </div>
      )}
    </div>
  )
}
