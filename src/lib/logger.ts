import fs from 'fs'
import path from 'path'

/**
 * Логирование промптов и ответов Gemini в файлы
 */

const LOGS_DIR = path.join(process.cwd(), 'logs')
const IS_PRODUCTION = process.env.NODE_ENV === 'production'

// Создаем папку logs если её нет (только в dev)
if (!IS_PRODUCTION && !fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true })
}

/**
 * Логирует только промпт (вызывается ДО запроса к API)
 */
export function logGeminiPrompt(prompt: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const sessionId = `session-${timestamp}`

  // В продакшене только console.log
  if (IS_PRODUCTION) {
    console.log(`📝 Prompt for ${sessionId} (first 200 chars):`, prompt.substring(0, 200))
    return sessionId
  }

  // В dev - пишем в файл
  const promptFile = path.join(LOGS_DIR, `${sessionId}-prompt.txt`)
  fs.writeFileSync(promptFile, prompt, 'utf-8')

  console.log(`📝 Prompt logged: logs/${sessionId}-prompt.txt`)

  return sessionId
}

/**
 * Логирует ответ для существующей сессии
 */
export function logGeminiResponse(sessionId: string, response: any) {
  const summary = `
=== GEMINI RESPONSE ${sessionId} ===
- Route ID: ${response.route?.id || 'N/A'}
- Route name: ${response.route?.name || 'N/A'}
- Points count: ${response.route?.points?.length || 0}
- Total distance: ${response.route?.statistics?.total_distance || 0} km
- Total time: ${response.route?.statistics?.total_walk_time || 0} min
- Personalization score: ${response.route?.personalization_score || 0}%
Success: ${response.route ? 'YES' : 'NO'}
  `.trim()

  // В продакшене только console.log
  if (IS_PRODUCTION) {
    console.log(summary)
    return
  }

  // В dev - пишем в файлы
  const responseFile = path.join(LOGS_DIR, `${sessionId}-response.json`)
  fs.writeFileSync(responseFile, JSON.stringify(response, null, 2), 'utf-8')

  const summaryFile = path.join(LOGS_DIR, `${sessionId}-summary.txt`)
  fs.writeFileSync(summaryFile, `${summary}\n\nPrompt file: ${sessionId}-prompt.txt\nResponse file: ${sessionId}-response.json`, 'utf-8')

  console.log(`✅ Response logged: logs/${sessionId}-response.json`)
}

/**
 * Логирует промпт и ответ вместе (для обратной совместимости)
 */
export function logGeminiInteraction(prompt: string, response: any) {
  const sessionId = logGeminiPrompt(prompt)
  logGeminiResponse(sessionId, response)
  return sessionId
}

/**
 * Логирует ошибку
 */
export function logGeminiError(prompt: string, error: Error) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const sessionId = `error-${timestamp}`

  const errorContent = `
=== GEMINI ERROR ${sessionId} ===
Timestamp: ${new Date().toISOString()}
Error: ${error.message}
Stack trace:
${error.stack}
  `.trim()

  // В продакшене только console.error
  if (IS_PRODUCTION) {
    console.error(errorContent)
    console.error('Prompt (first 200 chars):', prompt.substring(0, 200))
    return sessionId
  }

  // В dev - пишем в файлы
  const promptFile = path.join(LOGS_DIR, `${sessionId}-prompt.txt`)
  fs.writeFileSync(promptFile, prompt, 'utf-8')

  const errorFile = path.join(LOGS_DIR, `${sessionId}-error.txt`)
  fs.writeFileSync(errorFile, errorContent + `\n\nPrompt was saved to: ${sessionId}-prompt.txt`, 'utf-8')

  console.error(`❌ Error logged to: logs/${sessionId}-*`)

  return sessionId
}

/**
 * Получить список всех логов
 */
export function getLogsList() {
  if (IS_PRODUCTION) {
    return []
  }

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
  if (IS_PRODUCTION) {
    console.log('🧹 Log cleanup skipped in production')
    return 0
  }

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
