export function formatMoney(value: number | string | undefined | null, decimals: number = 2): string {
  if (value === undefined || value === null || value === '') return '0.00'
  const num = Number(value)
  if (isNaN(num) || !isFinite(num)) return '0.00'
  return num.toFixed(decimals)
}

export function formatTime(dateStr: string | number | Date | undefined | null): string {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return '-'
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const hh = String(date.getHours()).padStart(2, '0')
    const mm = String(date.getMinutes()).padStart(2, '0')
    return `${y}-${m}-${d} ${hh}:${mm}`
  } catch {
    return '-'
  }
}

export function formatDate(dateStr: string | number | Date | undefined | null): string {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return '-'
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  } catch {
    return '-'
  }
}

export function formatTimeAgo(dateStr: string | number | Date | undefined | null): string {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return '-'
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 0) return formatTime(dateStr)
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
    if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
    if (diff < 604800000) return Math.floor(diff / 86400000) + '天前'
    
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  } catch {
    return '-'
  }
}

export function safeGet<T>(obj: any, path: string, defaultValue: T): T {
  if (!obj) return defaultValue
  const keys = path.split('.')
  let result = obj
  for (const key of keys) {
    if (result === undefined || result === null) return defaultValue
    result = result[key]
  }
  return result !== undefined && result !== null ? result : defaultValue
}

export function safeNumber(value: any, defaultValue: number = 0): number {
  if (value === undefined || value === null || value === '') return defaultValue
  const num = Number(value)
  if (isNaN(num) || !isFinite(num)) return defaultValue
  return num
}

export function safeString(value: any, defaultValue: string = ''): string {
  if (value === undefined || value === null) return defaultValue
  return String(value)
}

export function safeArray<T>(value: any, defaultValue: T[] = []): T[] {
  if (Array.isArray(value)) return value
  return defaultValue
}
