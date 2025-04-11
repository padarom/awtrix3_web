import { NoCommunicationPossibleError } from './index'
import apiCommunicationMethod, { CommunicationMethod } from './apiCommunicationMethod'

// Define these to have properly typed generic API response types
type JSON =
  | string
  | number
  | boolean
  | null
  | JSON[]
  | {[key: string]: JSON}

interface AwtrixApi {
  get (endpoint: string, data?: object): Promise<JSON>
  post (endpoint: string, data?: object): Promise<boolean>
}

class HttpApi implements AwtrixApi {
  get baseUrl (): string {
    return 'http://10.2.0.32/api'
  }

  async get (endpoint: string, data = {}): Promise<JSON> {
    const searchParams = new URLSearchParams(data).toString()

    const response = await fetch(`${this.baseUrl}/${endpoint}?${searchParams}`)
    return response.json()
  }

  async post (endpoint: string, data = {}): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })

    return response.ok
  }
}

class PostMessageApi implements AwtrixApi {
  protected proxy (method: 'GET' | 'POST', endpoint: string, data = {}): Promise<JSON> {
    const messageID = Date.now().toString()

    return new Promise((resolve, reject) => {
      const handler = (event) => {
        if (event.data.id !== messageID) { return }
        window.removeEventListener('message', handler)

        if (event.data.success) {
          resolve(event.data.data)
        } else {
          reject(new Error(event.data.error))
        }
      }

      window.addEventListener('message', handler)
      window.parent.postMessage({
        id: messageID,
        url: `/api/${endpoint}`,
        method,
        body: method == 'POST' ? data : null,
        // isImage: ...
      }, '*')
    })
  }

  async get (endpoint: string, data = {}): Promise<JSON> {
    return this.proxy('GET', endpoint, data)
  }

  async post (endpoint: string, data = {}): Promise<boolean> {
    await this.proxy('POST', endpoint, data)

    // TODO: Determine success/failure
    return true
  }
}

/**
 * Generates a new API instance. This is automatically adjusted to use the best
 * available communication method with the Awtrix. If no communication with the
 * Awtrix can be established in the current browser session, this raises an
 * error.
 *
 * Should not be used manually as a shared API instance is already provided to
 * the Nuxt app itself, which can be retrieved via
 * `const { $awtrixApi } = useNuxtApp()`
 *
 * @return [AwtrixApi] the configured Awtrix API
 * @raise [Error] an error if no API can be created
 */
export default function (): AwtrixApi {
  const method = apiCommunicationMethod()

  switch (method) {
    case CommunicationMethod.HTTP:
      return new HttpApi()
    case CommunicationMethod.POST_MESSAGE:
      return new PostMessageApi()
    default:
      throw NoCommunicationPossibleError
  }
}
