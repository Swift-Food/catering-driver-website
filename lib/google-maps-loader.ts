let isLoading = false;
let isLoaded = false;
const callbacks: (() => void)[] = [];

export function loadGoogleMapsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isLoaded || (window as unknown as { google?: { maps?: unknown } }).google?.maps) {
      isLoaded = true;
      resolve();
      return;
    }

    if (isLoading) {
      callbacks.push(resolve);
      return;
    }

    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      isLoaded = true;
      resolve();
      return;
    }

    isLoading = true;

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      isLoading = false;
      isLoaded = true;
      resolve();
      callbacks.forEach((cb) => cb());
      callbacks.length = 0;
    };

    script.onerror = () => {
      isLoading = false;
      reject(new Error("Failed to load Google Maps script"));
    };

    document.head.appendChild(script);
  });
}
