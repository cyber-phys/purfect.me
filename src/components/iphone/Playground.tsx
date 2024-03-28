"use client";

import { LoadingSVG } from "@/components/button/LoadingSVG";
import { ChatMessageType, ChatTile } from "@/components/chat/ChatTile";
import { ColorPicker } from "@/components/colorPicker/ColorPicker";
import { AudioInputTile } from "@/components/config/AudioInputTile";
import { ConfigurationPanelItem } from "@/components/config/ConfigurationPanelItem";
import { NameValueRow } from "@/components/config/NameValueRow";
import { PlaygroundHeader } from "@/components/playground/PlaygroundHeader";
import {
  PlaygroundTab,
  PlaygroundTabbedTile,
  PlaygroundTile,
} from "@/components/playground/PlaygroundTile";
import { AgentMultibandAudioVisualizer } from "@/components/visualization/AgentMultibandAudioVisualizer";
import { useMultibandTrackVolume } from "@/hooks/useTrackVolume";
import { AgentState } from "@/lib/types";
import {
  VideoTrack,
  useConnectionState,
  useDataChannel,
  useLocalParticipant,
  useParticipantInfo,
  useRemoteParticipant,
  useRemoteParticipants,
  useTracks,
} from "@livekit/components-react";
import {
  ConnectionState,
  LocalParticipant,
  RoomEvent,
  Track,
} from "livekit-client";
import { QRCodeSVG } from "qrcode.react";
import { ReactNode, useCallback, useEffect, useMemo, useState, useRef} from "react";
import { Button } from "../button/Button";
import { ButtonImg } from "../button/ButtonImg";
import { useChat } from "@/components/chat/useChat";

interface Character {
  name: string;
  prompt: string;
  startingMessages: string[];
  voice: string;
  baseModel: string;
  isVideoTranscriptionEnabled: boolean;
  isVideoTranscriptionContinuous: boolean;
  videoTranscriptionModel: string;
  videoTranscriptionInterval: string;
}

export enum PlaygroundOutputs {
  Video,
  Audio,
  Chat,
}

export interface PlaygroundMeta {
  name: string;
  value: string;
}

export interface PlaygroundProps {
  logo?: ReactNode;
  title?: string;
  githubLink?: string;
  description?: ReactNode;
  themeColors: string[];
  defaultColor: string;
  outputs?: PlaygroundOutputs[];
  showQR?: boolean;
  onConnect: (connect: boolean, opts?: { token: string; url: string }) => void;
  metadata?: PlaygroundMeta[];
  videoFit?: "contain" | "cover";
  characterCard?: Character | null;
}

const headerHeight = 56;

const footerHeight = 56;

export default function Playground({
  logo,
  title,
  githubLink,
  description,
  outputs,
  showQR,
  themeColors,
  defaultColor,
  onConnect,
  metadata,
  videoFit,
  characterCard
}: PlaygroundProps) {
  const [agentState, setAgentState] = useState<AgentState>("offline");
  const [themeColor, setThemeColor] = useState(defaultColor);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [transcripts, setTranscripts] = useState<ChatMessageType[]>([]);
  const { localParticipant } = useLocalParticipant();
  const [isVideoVisible, setIsVideoVisible] = useState(true);
  const [isVoiceVisible, setIsVoiceVisible] = useState(true);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const roomState = useConnectionState();
  const tracks = useTracks();

  const toggleVideoVisibility = () => {
    setIsVideoVisible(true);
    setIsVoiceVisible(true);
    setIsChatVisible(false);
    setIsSettingsVisible(false);
  };

  const toggleChatVisibility = () => {
    setIsVideoVisible(false);
    setIsVideoVisible(false);
    setIsChatVisible(true);
    setIsSettingsVisible(false);  };

  const toggleSettingsVisibility  = () => {
    setIsVideoVisible(false);
    setIsVideoVisible(false);
    setIsChatVisible(false);
    setIsSettingsVisible(true);  
  };

  const participants = useRemoteParticipants({
    updateOnlyOn: [RoomEvent.ParticipantMetadataChanged],
  });
  const agentParticipant = participants.find((p) => p.isAgent);

  const { send: sendChat, chatMessages } = useChat();
  const visualizerState = useMemo(() => {
    if (agentState === "thinking") {
      return "thinking";
    } else if (agentState === "speaking") {
      return "talking";
    }
    return "idle";
  }, [agentState]);

  const agentAudioTrack = tracks.find(
    (trackRef) =>
      trackRef.publication.kind === Track.Kind.Audio &&
      trackRef.participant.isAgent
  );

  const agentVideoTrack = tracks.find(
    (trackRef) =>
      trackRef.publication.kind === Track.Kind.Video &&
      trackRef.participant.isAgent
  );

  const subscribedVolumes = useMultibandTrackVolume(
    agentAudioTrack?.publication.track,
    5
  );

  const localTracks = tracks.filter(
    ({ participant }) => participant instanceof LocalParticipant
  );
  const localVideoTrack = localTracks.find(
    ({ source }) => source === Track.Source.Camera
  );
  const localMicTrack = localTracks.find(
    ({ source }) => source === Track.Source.Microphone
  );

  const localMultibandVolume = useMultibandTrackVolume(
    localMicTrack?.publication.track,
    20
  );

  useEffect(() => {
    if (!agentParticipant) {
      setAgentState("offline");
      return;
    }
    let agentMd: any = {};
    if (agentParticipant.metadata) {
      agentMd = JSON.parse(agentParticipant.metadata);
    }
    if (agentMd.agent_state) {
      setAgentState(agentMd.agent_state);
    } else {
      setAgentState("starting");
    }
  }, [agentParticipant, agentParticipant?.metadata]);

  const isAgentConnected = agentState !== "offline";

  const onDataReceived = useCallback(
    (msg: any) => {
      if (msg.topic === "transcription") {
        const decoded = JSON.parse(
          new TextDecoder("utf-8").decode(msg.payload)
        );
        let timestamp = new Date().getTime();
        if ("timestamp" in decoded && decoded.timestamp > 0) {
          timestamp = decoded.timestamp;
        }
        setTranscripts([
          ...transcripts,
          {
            name: "You",
            message: decoded.text,
            timestamp: timestamp,
            isSelf: true,
          },
        ]);
      }
    },
    [transcripts]
  );

  const { send } = useDataChannel(onDataReceived);

  useEffect(() => {
    if (agentParticipant && characterCard) {
      const characterCardData = JSON.stringify({ 
        topic: "character_card", 
        character: characterCard 
      });
      send(new TextEncoder().encode(characterCardData), { reliable: true });
    }
  }, [agentParticipant]);

  // combine transcripts and chat together
  useEffect(() => {
    const allMessages = [...transcripts];
    for (const msg of chatMessages) {
      const isAgent = msg.is_assistant === true;
      const isSelf = msg.is_assistant === false;
      let name = msg.from?.name;
      if (!name) {
        if (isAgent) {
          name = "Agent";
        } else if (isSelf) {
          name = "You";
        } else {
          name = "Unknown";
        }
      }
      allMessages.push({
        name,
        message: msg.message,
        timestamp: msg?.timestamp,
        isSelf: isSelf,
      });
    }
    allMessages.sort((a, b) => a.timestamp - b.timestamp);
    setMessages(allMessages);
  }, [transcripts, chatMessages, localParticipant, agentParticipant]);

  const ConnectScreen = () => {
    return (
      <div className="w-full h-full flex justify-center items-center">
      <div
          className={`flex flex-col items-center justify-between gap-4 py-4 grow w-full max-h-[625px] selection:bg-${themeColor}-900`}
          style={{ height: `calc(100% - ${headerHeight}px - 100px` }}
      >
        <div>
          <p className="text-white text-xs p-1">Facetime Call</p>
          <p className="text-white text-xl">Operator</p>
        </div>
        <img src="/wowsocool.svg" style={{ width: '300px', height: '300px' }}/>
        <div className="flex justify-around w-full">
          <ButtonImg
            img="/call-decline.svg"
            width='45px'
            height='45px'
          >
            <></> 
          </ButtonImg>
          <ButtonImg
            img="/call-answer.svg"
            width='45px'
            height='45px'
            disabled={roomState === ConnectionState.Connecting}
            onClick={() => {
              onConnect(roomState === ConnectionState.Disconnected)
            }}
          >
            <></> 
          </ButtonImg>
        </div>
        </div>
      </div>
    );
  };

  const videoTileContent = useMemo(() => {
    const videoFitClassName = `object-${videoFit}`;
    return (
      <div className="flex flex-col w-full grow text-gray-950 bg-black rounded-sm border border-gray-800 relative">
        {agentVideoTrack ? (
          <VideoTrack
            trackRef={agentVideoTrack}
            className={`absolute top-1/2 -translate-y-1/2 ${videoFitClassName} object-position-center w-full h-full`}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-gray-700 text-center h-full w-full">
            <LoadingSVG />
            Waiting for video track
          </div>
        )}
      </div>
    );
  }, [agentVideoTrack, videoFit]);

  const audioTileContent = useMemo(() => {
    return (
      <div className="flex items-center justify-center w-full">
        {agentAudioTrack ? (
          <AgentMultibandAudioVisualizer
            state={agentState}
            barWidth={30}
            minBarHeight={30}
            maxBarHeight={150}
            accentColor={themeColor}
            accentShade={500}
            frequencies={subscribedVolumes}
            borderRadius={12}
            gap={16}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-700 text-center w-full">
            <LoadingSVG />
            Waiting for audio track
          </div>
        )}
      </div>
    );
  }, [agentAudioTrack, subscribedVolumes, themeColor, agentState]);

  const chatTileContent = useMemo(() => {
    return (
      <ChatTile
        messages={messages}
        accentColor={themeColor}
        onSend={sendChat}
      />
    );
  }, [messages, themeColor, sendChat]);

  const settingsTileContent = useMemo(() => {
    return (
      <>
      <div className="flex flex-col gap-4 h-full w-full items-start overflow-y-auto">
        {description && (
          <ConfigurationPanelItem title="Description">
            {description}
          </ConfigurationPanelItem>
        )}
        <ConfigurationPanelItem title="Status">
          <div className="flex flex-col gap-2">
            <NameValueRow
              name="Quantum tunnel"
              value={
                roomState === ConnectionState.Connecting ? (
                  <LoadingSVG diameter={16} strokeWidth={2} />
                ) : (
                  roomState
                )
              }
              valueColor={
                roomState === ConnectionState.Connected
                  ? `${themeColor}-500`
                  : "gray-500"
              }
            />
            <NameValueRow
              name="Multiverse Connected"
              value={
                isAgentConnected ? (
                  "true"
                ) : roomState === ConnectionState.Connected ? (
                  <LoadingSVG diameter={12} strokeWidth={2} />
                ) : (
                  "false"
                )
              }
              valueColor={isAgentConnected ? `${themeColor}-500` : "gray-500"}
            />
            <NameValueRow
              name="Other-self status"
              value={
                agentState !== "offline" && agentState !== "speaking" ? (
                  <div className="flex gap-2 items-center">
                    <LoadingSVG diameter={12} strokeWidth={2} />
                    {agentState}
                  </div>
                ) : (
                  agentState
                )
              }
              valueColor={
                agentState === "speaking" ? `${themeColor}-500` : "gray-500"
              }
            />
          </div>
        </ConfigurationPanelItem>
        {localVideoTrack && (
          <ConfigurationPanelItem
            title="Camera"
            deviceSelectorKind="videoinput"
          >
            <div className="relative">
              <VideoTrack
                className="rounded-sm border border-gray-800 opacity-70 w-full"
                trackRef={localVideoTrack}
              />
            </div>
          </ConfigurationPanelItem>
        )}
        {localMicTrack && (
          <ConfigurationPanelItem
            title="Microphone"
            deviceSelectorKind="audioinput"
          >
            <AudioInputTile frequencies={localMultibandVolume} />
          </ConfigurationPanelItem>
        )}
      </div>
      </>
    );
  }, [
    agentState,
    description,
    isAgentConnected,
    localMicTrack,
    localMultibandVolume,
    localVideoTrack,
    metadata,
    roomState,
    themeColor,
    themeColors,
    showQR,
  ]);

  let mobileTabs: PlaygroundTab[] = [];
  if (outputs?.includes(PlaygroundOutputs.Video)) {
    mobileTabs.push({
      title: "Video",
      content: (
        <PlaygroundTile
          className="w-full h-full grow"
          childrenClassName="justify-center"
        >
          {videoTileContent}
        </PlaygroundTile>
      ),
    });
  }

  if (outputs?.includes(PlaygroundOutputs.Audio)) {
    mobileTabs.push({
      title: "Audio",
      content: (
        <PlaygroundTile
          className="w-full h-full grow"
          childrenClassName="justify-center"
        >
          {audioTileContent}
        </PlaygroundTile>
      ),
    });
  }

  if (outputs?.includes(PlaygroundOutputs.Chat)) {
    mobileTabs.push({
      title: "Chat",
      content: chatTileContent,
    });
  }

  mobileTabs.push({
    title: "Settings",
    content: (
      <PlaygroundTile
        padding={false}
        backgroundColor="gray-950"
        className="h-full w-full basis-1/4 items-start overflow-y-auto flex"
        childrenClassName="h-full grow items-start"
      >
        {/* {settingsTileContent} */}
      </PlaygroundTile>
    ),
  });

  return (
    <>
      <PlaygroundHeader
        title={title}
        logo={logo}
        githubLink={githubLink}
        height={headerHeight}
        accentColor={themeColor}
        connectionState={roomState}
        onConnectClicked={() =>
          onConnect(roomState === ConnectionState.Disconnected)
        }
      />
      {/* <div className="flex flex-col h-full"> */}
      <div className="w-full h-full flex justify-center items-center">
        <div className="flex flex-col grow basis-1/2 gap-4 h-full lg:hidden pb-4">
        {roomState === ConnectionState.Connected ? (
            <PlaygroundTabbedTile
              className="h-full"
              tabs={mobileTabs}
              initialTab={mobileTabs.length - 1}
            />
        ):(
          <ConnectScreen/>
        )}
          </div>
        <div className="hidden lg:flex md:w-[300px] md:h-[650px] lg:w-[375px] lg:h-[812px] bg-[url('/IPhone_15_Vector.svg')] bg-no-repeat bg-contain flex-col justify-between">
          <div className="pt-8 lg:pt-10">
            <div className="text-center text-white">
            </div>
          </div>
          {roomState === ConnectionState.Connected ? (
        <>
          <div
            className={`flex gap-4 py-4 grow w-full max-h-[625px] selection:bg-${themeColor}-900`}
            style={{ height: `calc(100% - ${headerHeight}px - 100px` }}
          >
            { isVideoVisible && isVoiceVisible && (
            <div
              className={`flex-col grow basis-1/2 gap-4 h-full hidden lg:${
                !outputs?.includes(PlaygroundOutputs.Audio) &&
                !outputs?.includes(PlaygroundOutputs.Video)
                  ? "hidden"
                  : "flex"
              }`}
            >
              {isVideoVisible && outputs?.includes(PlaygroundOutputs.Video) && (
                <PlaygroundTile
                  title="Video"
                  className="w-full h-full grow max-w-[330px] max-h-[812px] lg:flex mx-auto"
                  childrenClassName="justify-center"
                >
                  {videoTileContent}
                </PlaygroundTile>
              )}
              {isVoiceVisible && outputs?.includes(PlaygroundOutputs.Audio) && (
                <PlaygroundTile
                  title="Audio"
                  className="w-full h-full grow max-w-[330px] lg:flex mx-auto"
                  childrenClassName="justify-center"
                >
                  {audioTileContent}
                </PlaygroundTile>
              )}
            </div>
            )}
            {isChatVisible && outputs?.includes(PlaygroundOutputs.Chat) && (
              <PlaygroundTile
                title="Chat"
                className="w-full h-full grow max-w-[330px] lg:flex mx-auto"
                >
                {chatTileContent}
              </PlaygroundTile>
            )}
            {isSettingsVisible && (
              <PlaygroundTile
                padding={false}
                backgroundColor="gray-950"
                className="h-full w-full items-start overflow-y-auto hidden max-w-[330px] lg:flex mx-auto"
                childrenClassName="h-full grow items-start"
              >
                {settingsTileContent}
              </PlaygroundTile>
            )}
          </div>
          <div className="flex justify-center gap-4 pb-[75px]">
            {/* Button to toggle video visibility */}
            <button
              onClick={toggleVideoVisibility}
            >
              <img src={'/facetime.svg'} style={{ width: '56px', height: '56px' }}/>
            </button>

            {/* Button to toggle chat visibility */}
            <button
              onClick={toggleChatVisibility}
            >
              <img src={'/messages.svg'} style={{ width: '56px', height: '56px' }}/>
            </button>

            {/* Button to toggle settings visibility */}
            <button
              onClick={toggleSettingsVisibility}
              // className={`bg-${themeColor}-500 text-white py-2 px-4 rounded`}
            >
              <img src={'/settings.svg'} style={{ width: '56px', height: '56px' }}/>
              {/* {isSettingsVisible ? 'Hide Settings' : 'Show Settings'} */}
            </button>
          </div>
        </>
        ):(
          <ConnectScreen/>
        )}
        </div>
      </div>
    </>
  );
}
