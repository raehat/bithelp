/** Simple id generator for intents, authorizations, settlements, receipts. */
export function createId(prefix: string): string {
  const t = Date.now().toString(36)
  const r = Math.random().toString(36).slice(2, 10)
  return `${prefix}_${t}_${r}`
}
