/**
 * Client-side file upload with XHR progress tracking.
 */

export interface UploadProgressEvent {
  loaded: number
  total: number
  percent: number
}

export function uploadFileWithProgress(
  file: File,
  onProgress?: (event: UploadProgressEvent) => void,
  signal?: AbortSignal
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const formData = new FormData()
    formData.append('file', file)

    // Handle abort signal
    if (signal) {
      if (signal.aborted) {
        reject(new DOMException('Upload aborted', 'AbortError'))
        return
      }
      signal.addEventListener('abort', () => {
        xhr.abort()
        reject(new DOMException('Upload aborted', 'AbortError'))
      })
    }

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress({
          loaded: e.loaded,
          total: e.total,
          percent: Math.round((e.loaded / e.total) * 100),
        })
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText)
          resolve(data.url)
        } catch {
          reject(new Error('Invalid response from upload server'))
        }
      } else {
        try {
          const data = JSON.parse(xhr.responseText)
          reject(new Error(data.error || `Upload failed (${xhr.status})`))
        } catch {
          reject(new Error(`Upload failed (${xhr.status})`))
        }
      }
    })

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'))
    })

    xhr.addEventListener('abort', () => {
      reject(new DOMException('Upload aborted', 'AbortError'))
    })

    xhr.open('POST', '/api/upload')
    xhr.timeout = 600_000 // 10 minutes — server needs time to forward to OSS
    xhr.addEventListener('timeout', () => {
      reject(new Error('Upload timed out — the server took too long to process the file'))
    })
    xhr.send(formData)
  })
}
