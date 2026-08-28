// lib/snap.ts - Dynamic Midtrans Snap Script Loader & Runner

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options: {
          onSuccess?: (result: any) => void;
          onPending?: (result: any) => void;
          onError?: (result: any) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

export function loadSnapScript(clientKey?: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (window.snap) {
      resolve(true);
      return;
    }

    const scriptId = 'midtrans-snap-script';
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';
    script.id = scriptId;
    script.src = isProduction
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';

    const snapClientKey =
      clientKey ||
      process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ||
      'Mid-client-NzoW4glWv_IMTgm8';

    script.setAttribute('data-client-key', snapClientKey);
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Midtrans Snap script');
      resolve(false);
    };

    document.body.appendChild(script);
  });
}

export async function openSnapPayment(
  token: string,
  callbacks: {
    onSuccess?: (result: any) => void;
    onPending?: (result: any) => void;
    onError?: (result: any) => void;
    onClose?: () => void;
  }
): Promise<void> {
  await loadSnapScript();
  if (window.snap) {
    window.snap.pay(token, callbacks);
  } else {
    console.error('Midtrans Snap is unavailable.');
    callbacks.onError?.({ message: 'Snap SDK failed to load' });
  }
}
