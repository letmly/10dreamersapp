import fs from 'fs'
import path from 'path'

/**
 * Логирование промптов и ответов Gemini в файлы
 */

const LOGS_DIR = path.join(process.cwd(), 'logs')

// Создаем папку logs если её нет
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true })
}

/**
 * Логирует промпт и ответ в отдельные файлы
 */
export function logGeminiInteraction(prompt: string, response: any) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const sessionId = `session-${timestamp}`

  // Файл с промптом
  const promptFile = path.join(LOGS_DIR, `${sessionId}-prompt.txt`)
  fs.writeFileSync(promptFile, prompt, 'utf-8')

  // Файл с ответом
  const responseFile = path.join(LOGS_DIR, `${sessionId}-response.json`)
  fs.writeFileSync(responseFile, JSON.stringify(response, null, 2), 'utf-8')

  // Также создаем summary файл
  const summaryFile = path.join(LOGS_DIR, `${sessionId}-summary.txt`)
  const summary = `
=== GEMINI INTERACTION SUMMARY ===
Timestamp: ${new Date().toISOString()}
Session ID: ${sessionId}

Prompt file: ${sessionId}-prompt.txt
Response file: ${sessionId}-response.json

Response stats:
- Route ID: ${response.route?.id || 'N/A'}
- Route name: ${response.route?.name || 'N/A'}
- Points count: ${response.route?.points?.length || 0}
- Total distance: ${response.route?.statistics?.total_distance || 0} km
- Total time: ${response.route?.statistics?.total_walk_time || 0} min
- Personalization score: ${response.route?.personalization_score || 0}%

Success: ${response.route ? 'YES' : 'NO'}
=== END SUMMARY ===
  `.trim()

  fs.writeFileSync(summaryFile, summary, 'utf-8')

  console.log(`📝 Logged to: logs/${sessionId}-*`)

  return sessionId
}

/**
 * Логирует ошибку
 */
export function logGeminiError(prompt: string, error: Error) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const sessionId = `error-${timestamp}`

  // Файл с промптом
  const promptFile = path.join(LOGS_DIR, `${sessionId}-prompt.txt`)
  fs.writeFileSync(promptFile, prompt, 'utf-8')

  // Файл с ошибкой
  const errorFile = path.join(LOGS_DIR, `${sessionId}-error.txt`)
  const errorContent = `
=== GEMINI ERROR ===
Timestamp: ${new Date().toISOString()}
Error: ${error.message}

Stack trace:
${error.stack}

Prompt was saved to: ${sessionId}-prompt.txt
=== END ERROR ===
  `.trim()

  fs.writeFileSync(errorFile, errorContent, 'utf-8')

  console.error(`❌ Error logged to: logs/${sessionId}-*`)

  return sessionId
}

/**
 * Получить список всех логов
 */
export function getLogsList() {
  const files = fs.readdirSync(LOGS_DIR)

  const sessions = new Map<string, { prompt?: string; response?: string; summary?: string; error?: string }>()

  files.forEach((file) => {
    const match = file.match(/^(session-[\d-T]+Z|error-[\d-T]+Z)-(prompt\.txt|response\.json|summary\.txt|error\.txt)$/)

    if (match) {
      const sessionId = match[1]
      const type = match[2]

      if (!sessions.has(sessionId)) {
        sessions.set(sessionId, {})
      }

      const session = sessions.get(sessionId)!

      if (type === 'prompt.txt') session.prompt = file
      else if (type === 'response.json') session.response = file
      else if (type === 'summary.txt') session.summary = file
      else if (type === 'error.txt') session.error = file
    }
  })

  return Array.from(sessions.entries()).map(([id, files]) => ({
    sessionId: id,
    ...files,
  }))
}

/**
 * Очистить старые логи (старше N дней)
 */
export function cleanOldLogs(daysToKeep: number = 7) {
  const files = fs.readdirSync(LOGS_DIR)
  const now = Date.now()
  const maxAge = daysToKeep * 24 * 60 * 60 * 1000

  let cleaned = 0

  files.forEach((file) => {
    const filePath = path.join(LOGS_DIR, file)
    const stats = fs.statSync(filePath)
    const age = now - stats.mtimeMs

    if (age > maxAge) {
      fs.unlinkSync(filePath)
      cleaned++
    }
  })

  console.log(`🧹 Cleaned ${cleaned} old log files`)

  return cleaned
}
