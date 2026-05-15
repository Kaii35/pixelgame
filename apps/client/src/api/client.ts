const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export interface RequestOptions extends RequestInit {
  accessToken?: string | null;
}

export const apiFetch = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { accessToken, headers, ...rest } = options;
  const response = await fetch(`${baseUrl}/api/v1${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    credentials: 'include',
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API ${response.status}: ${text}`);
  }
  return response.json() as Promise<T>;
};
