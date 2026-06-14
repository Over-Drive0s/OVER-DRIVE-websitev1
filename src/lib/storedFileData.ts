/** Data URL reads for small admin profile attachments (any file type). */

export async function readStoredFileDataUrl(
  file: File,
): Promise<{ ok: true; dataUrl: string } | { ok: false; error: string }> {
  const dataUrl = await new Promise<string | undefined>((resolve) => {
    const reader = new FileReader()
    reader.onload = () =>
      resolve(typeof reader.result === 'string' ? reader.result : undefined)
    reader.onerror = () => resolve(undefined)
    reader.readAsDataURL(file)
  })

  if (!dataUrl) {
    return { ok: false, error: 'Could not read the file.' }
  }

  return { ok: true, dataUrl }
}

export function isDataUrlImage(dataUrl: string): boolean {
  return dataUrl.startsWith('data:image/')
}

export function decodeDataUrlText(dataUrl: string, maxChars = 500_000): string | null {
  try {
    const comma = dataUrl.indexOf(',')
    if (comma === -1) return null
    const meta = dataUrl.slice(0, comma)
    const payload = dataUrl.slice(comma + 1)
    let text: string
    if (meta.includes(';base64')) {
      text = decodeURIComponent(
        Array.prototype.map
          .call(atob(payload), (char: string) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
          .join(''),
      )
    } else {
      text = decodeURIComponent(payload)
    }
    if (text.length > maxChars) {
      return `${text.slice(0, maxChars)}\n\n… truncated …`
    }
    return text
  } catch {
    return null
  }
}
