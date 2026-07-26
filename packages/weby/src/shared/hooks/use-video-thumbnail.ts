import { useState, useEffect } from "react";

export const useVideoThumbnail = (videoUrl: string | undefined): string | undefined => {
  const [thumbnail, setThumbnail] = useState<string | undefined>();

  useEffect(() => {
    if (!videoUrl) {
      setThumbnail(undefined);
      return;
    }

    let isMounted = true;
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.playsInline = true;

    const generateThumb = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/jpeg");
          if (isMounted) {
            setThumbnail(dataUrl);
          }
        }
      } catch (error) {
        console.warn("Failed to generate video thumbnail due to CORS or other error:", error);
      }
    };

    video.addEventListener("loadeddata", () => {
      video.currentTime = 0.1;
    });

    video.addEventListener("seeked", () => {
      generateThumb();
    });

    video.src = videoUrl;
    video.load();

    return () => {
      isMounted = false;
      video.removeAttribute("src");
      video.load();
    };
  }, [videoUrl]);

  return thumbnail;
};
