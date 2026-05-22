import { useState, useRef } from 'react'

// Resize & compress image to base64 before storing
function compressImage(file, maxWidth = 900, quality = 0.82) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const ratio = Math.min(1, maxWidth / img.width)
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * ratio)
        canvas.height = Math.round(img.height * ratio)
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

const TABS = [
  { id: 'url',    label: 'Paste URL',  icon: '🔗' },
  { id: 'upload', label: 'Upload',     icon: '📁' },
  { id: 'camera', label: 'Camera',     icon: '📷' },
]

export default function ImagePicker({ label, value, onChange }) {
  const [tab, setTab] = useState('url')
  const [urlInput, setUrlInput] = useState(value?.startsWith('data:') ? '' : (value || ''))
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()
  const camRef = useRef()

  async function handleFile(file) {
    if (!file) return
    setUploading(true)
    const base64 = await compressImage(file)
    onChange(base64)
    setUploading(false)
  }

  const preview = value || null

  return (
    <div>
      <label className="text-xs font-medium text-gray-600 block mb-1">{label}</label>

      {/* Preview */}
      {preview && (
        <div className="relative mb-2 rounded-xl overflow-hidden bg-gray-100 border border-gray-200" style={{ height: 120 }}>
          <img src={preview} alt="preview" className="w-full h-full object-cover" />
          <button
            onClick={() => { onChange(''); setUrlInput('') }}
            className="absolute top-1.5 right-1.5 bg-black/50 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center">
            ✕
          </button>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-2">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2 text-xs font-medium flex items-center justify-center gap-1 transition-colors
              ${tab === t.id ? 'bg-staff text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* URL tab */}
      {tab === 'url' && (
        <div className="flex gap-2">
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-staff"
          />
          <button
            onClick={() => { if (urlInput.trim()) onChange(urlInput.trim()) }}
            className="bg-staff text-white rounded-xl px-4 text-sm font-semibold">
            Set
          </button>
        </div>
      )}

      {/* Upload tab */}
      {tab === 'upload' && (
        <div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => handleFile(e.target.files[0])} />
          <button
            onClick={() => fileRef.current.click()}
            disabled={uploading}
            className="w-full border-2 border-dashed border-gray-300 rounded-xl py-6 text-sm text-gray-500 hover:border-staff hover:text-staff transition-colors disabled:opacity-50">
            {uploading ? 'Processing…' : (
              <span className="flex flex-col items-center gap-1">
                <span className="text-2xl">📁</span>
                <span>Tap to choose from your device</span>
                <span className="text-xs text-gray-400">JPG, PNG, WEBP supported</span>
              </span>
            )}
          </button>
        </div>
      )}

      {/* Camera tab */}
      {tab === 'camera' && (
        <div>
          <input ref={camRef} type="file" accept="image/*" capture="environment" className="hidden"
            onChange={(e) => handleFile(e.target.files[0])} />
          <button
            onClick={() => camRef.current.click()}
            disabled={uploading}
            className="w-full border-2 border-dashed border-gray-300 rounded-xl py-6 text-sm text-gray-500 hover:border-staff hover:text-staff transition-colors disabled:opacity-50">
            {uploading ? 'Processing…' : (
              <span className="flex flex-col items-center gap-1">
                <span className="text-2xl">📷</span>
                <span>Take a photo</span>
                <span className="text-xs text-gray-400">Opens your camera</span>
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
