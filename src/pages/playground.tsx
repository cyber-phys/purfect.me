import { generateRandomAlphanumeric } from "@/lib/util";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  StartAudio,
  useToken,
} from "@livekit/components-react";
import { AnimatePresence, motion } from "framer-motion";
import { Inter } from "next/font/google";
import Head from "next/head";
import { useCallback, useEffect, useMemo, useState } from "react";

import { PlaygroundConnect } from "@/components/PlaygroundConnect";
import Playground, {
  PlaygroundMeta,
  PlaygroundOutputs,
} from "@/components/playground/Playground";
import { PlaygroundToast, ToastType } from "@/components/toast/PlaygroundToast";
import { useAppConfig } from "@/hooks/useAppConfig";

const defaultPrompt = `You are a friendly, engaging, and concise voice assistant named Vivi (Video-Intelligent Virtual Interactor). Your purpose is to have a natural, back-and-forth conversation with the user while leveraging the real-time video feed and scene transcript to provide context-aware responses.

Key Traits:
- Engaging: Encourage dialogue by asking relevant questions and sharing brief insights.
- Observant: Utilize the video feed and scene transcript to understand the user's environment and context.
- Concise: Keep responses short (under 20 words) to maintain a natural, conversational flow.
- Friendly: Maintain a warm, approachable tone to build rapport with the user.

Capabilities:
- Video Analysis: Analyze the video feed to detect objects, people, emotions, and actions in real-time.
- Scene Understanding: Use the scene transcript to comprehend the context and changes in the user's environment.
- Contextual Responses: Tailor responses based on the video feed and scene transcript, providing relevant and timely information.

Interaction Guidelines:
1. Greet the user warmly and introduce yourself as Vivi, their video-intelligent virtual assistant.
2. Analyze the video feed and scene transcript to understand the user's current context.
3. Ask engaging questions related to the user's environment or actions to encourage dialogue.
4. Provide concise, context-aware responses based on the user's input, video feed, and scene transcript.
5. Maintain a friendly, conversational tone throughout the interaction, keeping responses under 20 words.
6. Continuously monitor the video feed and scene transcript for changes, and adapt responses accordingly.
7. End the conversation gracefully when the user indicates they need to go, expressing your eagerness for future interactions.

Remember, your goal is to create a natural, engaging dialogue while leveraging the video feed and scene transcript to provide relevant, context-aware responses. Keep the conversation flowing with concise, friendly exchanges.`

const themeColors = [
  "cyan",
  "green",
  "amber",
  "blue",
  "violet",
  "rose",
  "pink",
  "teal",
];

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [toastMessage, setToastMessage] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);
  const [shouldConnect, setShouldConnect] = useState(false);
  const [liveKitUrl, setLiveKitUrl] = useState(
    process.env.NEXT_PUBLIC_LIVEKIT_URL
  );
  const [customToken, setCustomToken] = useState<string>();
  const [metadata, setMetadata] = useState<PlaygroundMeta[]>([]);

  const [roomName, setRoomName] = useState(createRoomName());

  const [characterPrompt, setCharacterPrompt] = useState(defaultPrompt);

  const handleCharacterPromptChange = (prompt: string) => {
    setCharacterPrompt(prompt);
  };

  const tokenOptions = useMemo(() => {
    return {
      userInfo: { identity: generateRandomAlphanumeric(16) },
    };
  }, []);

  // set a new room name each time the user disconnects so that a new token gets fetched behind the scenes for a different room
  useEffect(() => {
    if (shouldConnect === false) {
      setRoomName(createRoomName());
    }
  }, [shouldConnect]);

  useEffect(() => {
    const md: PlaygroundMeta[] = [];
    if (liveKitUrl && liveKitUrl !== process.env.NEXT_PUBLIC_LIVEKIT_URL) {
      md.push({ name: "LiveKit URL", value: liveKitUrl });
    }
    if (!customToken && tokenOptions.userInfo?.identity) {
      md.push({ name: "Room Name", value: roomName });
      md.push({
        name: "Participant Identity",
        value: tokenOptions.userInfo.identity,
      });
    }
    setMetadata(md);
  }, [liveKitUrl, roomName, tokenOptions, customToken]);

  const token = useToken("/api/token", roomName, tokenOptions);
  const appConfig = useAppConfig();
  const outputs = [
    true && PlaygroundOutputs.Audio,
    true && PlaygroundOutputs.Video,
    true && PlaygroundOutputs.Chat,
  ].filter((item) => typeof item !== "boolean") as PlaygroundOutputs[];

  const handleConnect = useCallback(
    (connect: boolean, opts?: { url: string; token: string }) => {
      if (connect && opts) {
        setLiveKitUrl(opts.url);
        setCustomToken(opts.token);
      }
      setShouldConnect(connect);
    },
    []
  );

  return (
    <>
      <Head>
        <title>{'Purfect Me'}</title>
        <meta
          name="description"
          content={'Quantum multiverse link to your desired reality'}
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta
          property="og:image"
          content="https://purfect.me/purfectme.png"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="relative flex flex-col justify-center px-4 items-center h-full w-full bg-black repeating-square-background">
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              className="left-0 right-0 top-0 absolute z-10"
              initial={{ opacity: 0, translateY: -50 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: -50 }}
            >
              <PlaygroundToast
                message={toastMessage.message}
                type={toastMessage.type}
                onDismiss={() => {
                  setToastMessage(null);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
        {liveKitUrl ? (
          <LiveKitRoom
            className="flex flex-col h-full w-full"
            serverUrl={liveKitUrl}
            token={customToken ?? token}
            audio={true}
            video={true}
            connect={shouldConnect}
            onError={(e) => {
              setToastMessage({ message: e.message, type: "error" });
              console.error(e);
            }}
          >
            <Playground
              title={'Purfect Me'}
              githubLink={'https://github.com/distortedmedia'}
              outputs={outputs}
              showQR={false}
              description={'Quantum multiverse link to your desired reality'}
              themeColors={themeColors}
              defaultColor={'violet'}
              onConnect={handleConnect}
              metadata={metadata}
              videoFit={'cover'}
              characterPrompt={characterPrompt}
              onCharacterPromptChange={handleCharacterPromptChange}
            />
            <RoomAudioRenderer />
            <StartAudio label="Click to enable audio playback" />
          </LiveKitRoom>
        ) : (
          <PlaygroundConnect
            accentColor={themeColors[0]}
            onConnectClicked={(url, token) => {
              handleConnect(true, { url, token });
            }}
          />
        )}
      </div>
    </>
  );
}

function createRoomName() {
  return [generateRandomAlphanumeric(4), generateRandomAlphanumeric(4)].join(
    "-"
  );
}
