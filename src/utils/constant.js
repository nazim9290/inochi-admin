// Read once and re-export — avoids `import.meta.env` references scattered through the codebase.

export const BaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export const YoutubeApiKey = import.meta.env.VITE_YOUTUBE_API_KEY || '';

if (!BaseUrl && import.meta.env.DEV) {
  console.warn(
    '[config] VITE_API_BASE_URL is not set. Backend requests will fail. ' +
      'Copy .env.example to .env and fill it in.'
  );
}
