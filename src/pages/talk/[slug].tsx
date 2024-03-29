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
import { useRouter } from 'next/router';

import { IPhoneConnect } from "@/components/iPhoneConnect";
import Playground, {
  PlaygroundMeta,
  PlaygroundOutputs,
} from "@/components/iphone/Playground";
import { PlaygroundToast, ToastType } from "@/components/toast/PlaygroundToast";
import { useAppConfig } from "@/hooks/useAppConfig";

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

export default function Page() {
  const router = useRouter();
  const { slug } = router.query;
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCharacter = async () => {
      let characterId = slug;
  
      if (!characterId) {
        characterId = process.env.NEXT_PUBLIC_DEFAULT_CHARACTER_ID;
      }
  
      try {
        const response = await fetch(`/api/get-character?id=${characterId}`);
        if (response.ok) {
          const data: Character = await response.json();
          setCharacter(data);
          console.log(data);
        } else {
          setError('Failed to fetch character');
          if (!slug) {
            // If the slug wasn't provided, we already used the default character ID
            setLoading(false);
            return;
          }
          // Try fetching with the default character ID if the slug was provided but failed
          const defaultResponse = await fetch(`/api/get-character?id=${process.env.NEXT_PUBLIC_DEFAULT_CHARACTER_ID}`);
          if (defaultResponse.ok) {
            const defaultData: Character = await defaultResponse.json();
            setCharacter(defaultData);
            console.log(defaultData);
          } else {
            setError('Failed to fetch default character');
          }
        }
      } catch (error) {
        setError('An error occurred while fetching the character');
      }
      setLoading(false);
    };
  
    fetchCharacter();
  }, [slug]);

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
      <main className="relative flex flex-col justify-center px-4 items-center h-full w-full bg-black repeating-square-background">
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
              characterCard={character}
            />
            <RoomAudioRenderer />
            <StartAudio label="Click to enable audio playback" />
          </LiveKitRoom>
        ) : (
          <IPhoneConnect
            accentColor={themeColors[0]}
            onConnectClicked={(url, token) => {
              handleConnect(true, { url, token });
            }}
          />
        )}
      </main>
    </>
  );
}

function createRoomName() {
  return [generateRandomAlphanumeric(4), generateRandomAlphanumeric(4)].join(
    "-"
  );
}
