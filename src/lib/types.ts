import { LocalAudioTrack, LocalVideoTrack } from "livekit-client";

export interface SessionProps {
  roomName: string;
  identity: string;
  audioTrack?: LocalAudioTrack;
  videoTrack?: LocalVideoTrack;
  region?: string;
  turnServer?: RTCIceServer;
  forceRelay?: boolean;
}

export interface TokenResult {
  identity: string;
  accessToken: string;
}

export type AgentState =
  | "idle"
  | "listening"
  | "speaking"
  | "thinking"
  | "offline"
  | "starting";

export type Character = {
  id: string;
  name: string;
  voice: string;
  base_model: string;
  bio: string;
  creation_time: string;
};

export type CharacterCard = {
  id: string;
  name: string;
  character_prompt: string;
  video_system_prompt: string;
  video_prompt: string;
  canvas_system_prompt: string;
  canvas_prompt: string;
  starting_messages: string[]; // Array of strings
  voice: string;
  base_model: string;
  is_video_transcription_enabled: number; // 1 for true, 0 for false
  is_video_transcription_continuous: number; // 1 for true, 0 for false
  video_transcription_model: string;
  video_transcription_interval: number;
  is_canvas_enabled: number; // 1 for true, 0 for false
  canvas_model: string;
  canvas_interval: number;
  bio: string;
  creation_time: string;
};
