import { useCallback, useMemo, useRef, useState } from 'react';
import * as Cesium from 'cesium';
import { streamChat } from '@/services/api';
import { useViewerStore } from '@/store/useViewerStore';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

const CMD_REGEX = /<CMD>([\s\S]*?)<\/CMD>/g;

type FlyToParams = {
  lat: number;
  lon: number;
  height?: number;
  heading?: number;
  pitch?: number;
  roll?: number;
};

function applyFlyTo(viewer: Cesium.Viewer, params: FlyToParams) {
  const { lat, lon, height = 3000, heading = 0, pitch = -45, roll = 0 } = params;
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(lon, lat, height),
    orientation: {
      heading: Cesium.Math.toRadians(heading),
      pitch: Cesium.Math.toRadians(pitch),
      roll: Cesium.Math.toRadians(roll)
    },
    duration: 2.5
  });
}

export function useDifyChat() {
  const viewer = useViewerStore((s) => s.viewer);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setLoading(false);
  }, []);

  const handleCommand = useCallback(
    (chunk: string) => {
      if (!viewer) return;
      let match: RegExpExecArray | null;
      while ((match = CMD_REGEX.exec(chunk)) !== null) {
        try {
          const parsed = JSON.parse(match[1]);
          if (parsed?.action === 'flyTo' && parsed.params) {
            applyFlyTo(viewer, parsed.params as FlyToParams);
          }
        } catch (err) {
          console.warn('Failed to parse CMD chunk', err);
        }
      }
    },
    [viewer]
  );

  const sendMessage = useCallback(
    (content: string) => {
      setMessages((prev) => [...prev, { role: 'user', content }]);
      setLoading(true);

      const payload = {
        inputs: { prompt: content },
        response_mode: 'streaming'
      };

      controllerRef.current = streamChat(payload, (dataLine) => {
        handleCommand(dataLine);
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'assistant' && last.__streaming) {
            const updated = [...prev];
            // @ts-expect-error augment streaming temp flag
            updated[updated.length - 1] = {
              ...last,
              content: last.content + dataLine.replace(/^data:\s*/, '')
            };
            return updated;
          }
          // Start a new assistant message in streaming mode
          return [
            ...prev,
            {
              role: 'assistant',
              content: dataLine.replace(/^data:\s*/, ''),
              // temp flag to mark streaming state
              // @ts-expect-error runtime flag
              __streaming: true
            } as Message
          ];
        });
      });

      // Clear streaming flag when finished
      controllerRef.current.signal.addEventListener('abort', () => {
        setMessages((prev) =>
          prev.map((m) => {
            // @ts-expect-error cleanup streaming flag
            if (m.__streaming) {
              const { __streaming, ...rest } = m as any;
              return rest;
            }
            return m;
          })
        );
      });
    },
    [handleCommand]
  );

  const state = useMemo(
    () => ({ messages, loading, sendMessage, stop }),
    [messages, loading, sendMessage, stop]
  );

  return state;
}

export type UseDifyChatReturn = ReturnType<typeof useDifyChat>;
