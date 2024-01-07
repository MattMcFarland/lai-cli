import { URL } from 'url';
export function buildBaseUri(address: string) {
  try {
    const url = new URL(address);
    return url
  } catch {
    return "http://localhost:8080"
  }
}

export function handleAsyncError(error: any) {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error(`Error: ${error.response.status} ${error.response.statusText}`);
    if (error.response.data && error.response.data.message) {
      console.error(`Message: ${error.response.data.message}`);
    }
  } else if (error.request) {
    // The request was made but no response was received
    console.error('Error: No response was received from the server.');
  } else {
    // Now we want a stack-trace
    throw error
  }
}
