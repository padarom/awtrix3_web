export enum CommunicationMethod {
  NONE,
  HTTP,
  POST_MESSAGE,
}

/**
 * Determines the API communication method to use for the current browser client
 * session. This takes into account the current protocol as well as whether the
 * application is displayed in an iFrame.
 *
 * @return [CommunicationMethod] the method used for communication
 */
export default function (): CommunicationMethod {
  // If we are in an iFrame we can communicate via a postMessage "proxy"
  if (window.parent !== window) {
    return CommunicationMethod.POST_MESSAGE
  }

  // If we are within HTTP we can directly communicate via HTTP, given that the
  // API has CORS enabled
  if (window.location.protocol === 'http:' || window.location.protocol === 'file:') {
    return CommunicationMethod.HTTP
  }

  return CommunicationMethod.NONE
}
