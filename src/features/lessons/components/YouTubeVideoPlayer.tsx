"use client";

import YouTube from "react-youtube";

export interface YouTubeVideoPlayerProps {
  videoId: string;
  onFinishedVideo?: () => void;
}

export function YouTubeVideoPlayer(props: YouTubeVideoPlayerProps) {
  return (
    <YouTube
      videoId={props.videoId}
      className="w-full h-full"
      opts={{ width: "100%", height: "100%" }}
      onEnd={props.onFinishedVideo}
    />
  );
}
