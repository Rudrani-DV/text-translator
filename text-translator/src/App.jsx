import { useMemo, useState } from 'react'
import SplitText from './SplitText'

const LANGUAGES = [
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'it', label: 'Italian' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'ru', label: 'Russian' },
  { code: 'tr', label: 'Turkish' },
  { code: 'ar', label: 'Arabic' },
  { code: 'hi', label: 'Hindi' },
  { code: 'bn', label: 'Bengali' },
  { code: 'ur', label: 'Urdu' },
  { code: 'id', label: 'Indonesian' },
  { code: 'vi', label: 'Vietnamese' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'zh-CN', label: 'Chinese (Simplified)' },
]

const RAPIDAPI_URL =
  'https://google-translate1.p.rapidapi.com/language/translate/v2'
const RAPIDAPI_HOST = 'google-translate1.p.rapidapi.com'

function App() {
  const [inputText, setInputText] = useState('')
  const [targetLanguage, setTargetLanguage] = useState('es')
  const [translatedText, setTranslatedText] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const selectedLanguageLabel = useMemo(() => {
    return (
      LANGUAGES.find((lang) => lang.code === targetLanguage)?.label ??
      targetLanguage
    )
  }, [targetLanguage])

  const rapidApiKey = import.meta.env.VITE_RAPIDAPI_KEY
  const rapidApiUrl =
    import.meta.env.VITE_RAPIDAPI_URL ||
    import.meta.env.VITE_TRANSLATE_API_URL ||
    RAPIDAPI_URL
  const rapidApiHost = (() => {
    try {
      return new URL(rapidApiUrl).host
    } catch {
      return (
        import.meta.env.VITE_RAPIDAPI_HOST ||
        import.meta.env.VITE_TRANSLATE_API_HOST ||
        RAPIDAPI_HOST
      )
    }
  })()

  const canTranslate = inputText.trim().length > 0 && !isTranslating

  const translate = async () => {
    const text = inputText.trim()
    if (!text) return

    if (!rapidApiKey) {
      setError('Missing VITE_RAPIDAPI_KEY in your environment.')
      return
    }

    if (rapidApiUrl.toLowerCase().includes('/detect')) {
      setError(
        'Your VITE_RAPIDAPI_URL is a language-detect endpoint. Use a translate endpoint URL instead.',
      )
      return
    }

    setError('')
    setCopied(false)
    setIsTranslating(true)

    try {
      const body = new URLSearchParams({
        q: text,
        source: 'en',
        target: targetLanguage,
      })

      const response = await fetch(rapidApiUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'x-rapidapi-key': rapidApiKey,
          'x-rapidapi-host': rapidApiHost,
        },
        body,
      })

      const responseText = await response.text()
      const data = (() => {
        try {
          return JSON.parse(responseText)
        } catch {
          return null
        }
      })()

      if (!response.ok) {
        const message =
          data?.message || data?.error?.message || 'Translation failed.'
        throw new Error(`Translation failed (HTTP ${response.status}): ${message}`)
      }

      const nextText =
        data?.data?.translations?.[0]?.translatedText ??
        data?.translations?.[0]?.translatedText ??
        data?.data?.translation ??
        data?.translation ??
        data?.data?.translatedText ??
        data?.translatedText

      if (!nextText) {
        const looksLikeDetect =
          Boolean(data?.data?.detections) ||
          Boolean(data?.detections) ||
          Boolean(data?.data?.language)
        if (looksLikeDetect) {
          throw new Error(
            'Your API response looks like language detection, not translation. Switch to a translate endpoint.',
          )
        }

        const detail = responseText ? ` Response: ${responseText.slice(0, 220)}` : ''
        throw new Error(`No translation returned by the API.${detail}`)
      }

      setTranslatedText(nextText)
    } catch (e) {
      setTranslatedText('')
      setError(e instanceof Error ? e.message : 'Translation failed.')
    } finally {
      setIsTranslating(false)
    }
  }

  const clearAll = () => {
    setInputText('')
    setTranslatedText('')
    setError('')
    setCopied(false)
  }

  const copyOutput = async () => {
    if (!translatedText) return
    try {
      await navigator.clipboard.writeText(translatedText)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <header className=" border-white/10">
        <div className="mx-auto max-w-5xl px-4 py-5 text-center">
          <SplitText
            text="Text Translator"
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            delay={60}
            duration={0.6}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 18 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="center"
            tag="h1"
          />
        </div>
      </header>

      <main className="mx-auto max-w-5xl mt-20 px-4 py-8">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="w-full sm:max-w-xs">
              <label className="text-sm font-medium text-slate-200">
                Target language
              </label>
              <select
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none ring-0 focus:border-white/20"
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={translate}
                disabled={!canTranslate}
              >
                {isTranslating ? 'Translating...' : 'Translate'}
              </button>
              <button
                type="button"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-white/10"
                onClick={clearAll}
              >
                Clear
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-slate-200">
                  English input
                </h2>
                <span className="text-xs text-slate-400">
                  {inputText.length} chars
                </span>
              </div>
              <textarea
                className="mt-3 h-40 w-full resize-none rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-white/20"
                placeholder="Type your English text here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-slate-200">
                  Output ({selectedLanguageLabel})
                </h2>
                <button
                  type="button"
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-100 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={copyOutput}
                  disabled={!translatedText}
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="mt-3 h-40 w-full overflow-auto rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100">
                {translatedText ? (
                  <p className="whitespace-pre-wrap">{translatedText}</p>
                ) : (
                  <p className="text-slate-400">
                    Your translation will appear here.
                  </p>
                )}
              </div>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          {!rapidApiKey ? (
            <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              Set VITE_RAPIDAPI_KEY in a .env file, then restart the dev server.
            </div>
          ) : null}
        </div>

        <footer className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-slate-400">
          <p>Source language is fixed to English.</p>
          <p className="mt-2">Made by Rudrani😊</p>
        </footer>
      </main>
    </div>
  )
}

export default App
