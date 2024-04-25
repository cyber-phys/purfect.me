"use client";
import { DataPacket_Kind } from "livekit-client";
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
import { AgentState, CharacterCard } from "@/lib/types";
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
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { Button } from "../button/Button";
import { useChat } from "@/components/chat/useChat";
import ConnectionModal from "./ConnectModal";
import LoadingScreen from "./LoadingScreen";
// import * as fal from "@fal-ai/serverless-client";
import html2canvas from 'html2canvas';
import dynamic from 'next/dynamic';
import { CSS2DRenderer, CSS2DObject } from 'three-stdlib';
import * as d3 from 'd3-force';

// const ForceGraph2D = dynamic(() => import('react-force-graph'), {
//   ssr: false,
// });

const ForceGraph2D = dynamic(() => import('react-force-graph').then(mod => ({ default: mod.ForceGraph2D })), {
  ssr: false,
});

// import { ForceGraph2D } from 'react-force-graph';
import { ForceGraphMethods } from 'react-force-graph-2d';

// fal.config({
//   proxyUrl: "/api/fal/proxy",
// });

function randomSeed(): number {
  const multipliers = [2342534, 1235392, 875441, 102321];
  const multiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
  return Math.floor(Math.random() * multiplier);
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
  characterCard?: CharacterCard | null;
  room: string;
  setroom: (room: string) => void;
  characterId: string;
}

interface ChunkNode {
  id: string;
  // Add other properties of chunkNodes here
}

interface TreeChunks {
  [treeId: string]: {
    [chunkNumber: number]: ChunkNode[];
  };
}

interface GraphDataState {
  nodes: any[]; // Replace 'any' with a more specific type if possible
  links: any[]; // Replace 'any' with a more specific type if possible
  receivedChunks: TreeChunks;
}

const headerHeight = 56;
const displayAudioTile = false;
const displayVideoTile = false;

const htmlString = `
<!DOCTYPE html>
<html>
<head>
  <title>Digital Overlord's Abstract Art</title>
  <style>
    body { margin: 0; background-color: #000; }
    canvas { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script>
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const geometry = new THREE.TorusKnotGeometry(10, 3, 200, 32);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5,
      metalness: 0.5,
      wireframe: true,
      wireframeLinewidth: 1
    });
    const torusKnot = new THREE.Mesh(geometry, material);
    scene.add(torusKnot);

    const pointLight = new THREE.PointLight(0x8a2be2, 0.5, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    const ambientLight = new THREE.AmbientLight(0x800080, 0.1);
    scene.add(ambientLight);

    camera.position.z = 30;

    function animate() {
      requestAnimationFrame(animate);
      torusKnot.rotation.x += 0.005;
      torusKnot.rotation.y += 0.005;
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  </script>
</body>
</html>
`;

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
  characterCard,
  room,
  setroom,
  characterId,
}: PlaygroundProps) {
  const fgRef = useRef<ForceGraphMethods<any, any> | undefined>(undefined);
  const [agentState, setAgentState] = useState<AgentState>("offline");
  const [themeColor, setThemeColor] = useState(defaultColor);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const { localParticipant } = useLocalParticipant();
  const characterPromptRef = useRef<HTMLTextAreaElement>(null);
  const [iframeContent, setIframeContent] = useState(htmlString);
  const [sdPrompt, setSDPrompt] = useState("A high resoultion photo taken on a cannon 5D mark ii")
  const roomState = useConnectionState();
  const tracks = useTracks();
  const [imageUrl, setImageUrl] = useState<string>("");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  // const [canvasImageUrl, setCanvasImageUrl] = useState<string | null>(null);
  // const [createNewFrame, setCreateNewFrame] = useState(true);
  const [graphData, setGraphData] = useState<GraphDataState>({
    nodes: [],
    links: [],
    receivedChunks: {},
  });

  const participants = useRemoteParticipants({
    updateOnlyOn: [RoomEvent.ParticipantMetadataChanged],
  });
  const agentParticipant = participants.find((p) => p.isAgent);

  const { send: sendChat, chatMessages, updateHistory: updateHistory } = useChat();


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
      trackRef.participant.isAgent,
  );

  const agentVideoTrack = tracks.find(
    (trackRef) =>
      trackRef.publication.kind === Track.Kind.Video &&
      trackRef.participant.isAgent,
  );

  const subscribedVolumes = useMultibandTrackVolume(
    agentAudioTrack?.publication.track,
    5,
  );

  const localTracks = tracks.filter(
    ({ participant }) => participant instanceof LocalParticipant,
  );

  const localVideoTrack = localTracks.find(
    ({ source }) => source === Track.Source.Camera,
  );

  const localMicTrack = localTracks.find(
    ({ source }) => source === Track.Source.Microphone,
  );

  const localMultibandVolume = useMultibandTrackVolume(
    localMicTrack?.publication.track,
    20,
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
      if (msg.topic === "lk-canvas-update-topic") {
        const decoded = JSON.parse(
          new TextDecoder("utf-8").decode(msg.payload)
        );
        if (decoded.html) {
          console.log("got html")
          console.log(decoded.html)
          setIframeContent(decoded.html);
        }
      } else if (msg.topic === "sdprompt") {
        const decoded = JSON.parse(
          new TextDecoder("utf-8").decode(msg.payload)
        );
        if (decoded.prompt) {
          setSDPrompt(decoded.prompt);
        }
      } else if (msg.topic === "lk-node-tree-init-topic") {
        const decoded = JSON.parse(new TextDecoder("utf-8").decode(msg.payload));
        const { nodes: chunkNodes, chunk, total_chunks, tree_id } = decoded;
      
        // Update the state to store the received chunk
        setGraphData((prevGraphData) => {
          const updatedReceivedChunks: TreeChunks = {
            ...prevGraphData.receivedChunks,
            [tree_id]: {
              ...prevGraphData.receivedChunks[tree_id],
              [chunk]: chunkNodes,
            },
          };
      
          const receivedChunksForTree = updatedReceivedChunks[tree_id];
          if (Object.keys(receivedChunksForTree).length === total_chunks) {
            // All chunks received, combine them into a single array
            const allNodes = Object.values(receivedChunksForTree).flat();
      
            const newNodes = allNodes.map((node: any) => ({
              id: node.id,
              name: node.participant,
              type: node.is_assistant,
              val: 1,
              messages: node.message,
            }));
      
            const newLinks = allNodes
              .filter((node: any) => node.parent_id)
              .map((node: any) => ({
                source: node.parent_id,
                target: node.id,
              }));
      
            // Return the updated graph data with the complete set of nodes and links
            return {
              nodes: newNodes,
              links: newLinks,
              receivedChunks: updatedReceivedChunks,
            };
          } else {
            // Not all chunks received yet, just update the receivedChunks part of the state
            return { ...prevGraphData, receivedChunks: updatedReceivedChunks };
          }
        });
      } else if (msg.topic === "lk-node-tree-update-topic") {
        const decoded = JSON.parse(new TextDecoder("utf-8").decode(msg.payload));
        const newNode = decoded;

        setGraphData((prevGraphData) => {
          // Create a new node object from the received ChatNode
          const addedNode = {
            id: newNode.id,
            name: newNode.participant,
            type: newNode.is_assistant,
            val: 1,
            messages: newNode.message,
          };

          // Determine if there's a link to be created (if the new node has a parent_id)
          const newLink = newNode.parent_id ? {
            source: newNode.parent_id,
            target: newNode.id,
          } : null;

          // Append the new node to the existing nodes array
          const updatedNodes = [...prevGraphData.nodes, addedNode];

          // Append the new link to the existing links array, if it exists
          const updatedLinks = newLink ? [...prevGraphData.links, newLink] : [...prevGraphData.links];

          // Return the updated graph data with the new node and possibly a new link
          return {
            ...prevGraphData,
            nodes: updatedNodes,
            links: updatedLinks,
          };
        });
      } else if (msg.topic === "lk-chat-history-update-topic") {
      console.log("refesh")
      const decoded = JSON.parse(
        new TextDecoder("utf-8").decode(msg.payload)
      );
      const newMessages = decoded.nodes.map((node: any) => ({
        id: node.id,
        timestamp: node.timestamp,
        isSelf: !node.is_assistant,
        highlight_word_count: node.highlight_word_count,
        name: node.participant, 
        message: node.message,
        parent_id: node.parent_id,
        alt_ids: node.alt_ids,
        conversation_id: node.conversation_id,
        character_id: node.character_id,
        model: node.model,
        type: node.type,
      }));
      console.log(newMessages)
      updateHistory?.(newMessages)
    }
  },
    [updateHistory]
  );

  const { send } = useDataChannel(onDataReceived);

  const handleCommand = useCallback((command: string, arg?: string) => {
    // Prepare the command object
    const commandPayload = {
      topic: "command",
      data: { command, arg }
    };

    switch (command) {
      case "fw":
        // Handle forward command, e.g., navigate forward in messages or perform an action
        console.log(`Forward command received with argument: ${arg}`);
        // Send the command to the backend
        send(new TextEncoder().encode(JSON.stringify(commandPayload)), { reliable: true, topic: "command" });
        break;
      case "rgen":
        // Handle regenerate command or similar action
        console.log("Regenerate command received");
        // Send the command to the backend
        send(new TextEncoder().encode(JSON.stringify(commandPayload)), { reliable: true , topic: "command"});
        break;
      case "alt":
        // Handle alternate command, e.g., switch modes or perform an alternate action
        console.log(`Alternate command received with argument: ${arg}`);
        // Send the command to the backend
        send(new TextEncoder().encode(JSON.stringify(commandPayload)), { reliable: true, topic: "command" });
        break;
      default:
        console.log(`Unknown command: ${command}`);
    }
  }, [send]);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleCharacterPromptChange(characterPromptRef.current?.value || "");
  };

  //TODO: lets get rid of this
  const handleCharacterPromptChange = (prompt: string) => {
    send(
      new TextEncoder().encode(
        JSON.stringify({ topic: "character_prompt", prompt }),
      ),
      { reliable: true },
    );
  };

  // Todo lets get rid of this
  // useEffect(() => {
  //   if (agentParticipant) {
  //     send(
  //       new TextEncoder().encode(
  //         JSON.stringify({ topic: "character_prompt", prompt }),
  //       ),
  //       { reliable: true },
  //     );
  //   }
  // }, [agentParticipant]);

  // Send Character Chard when Agent connects
  useEffect(() => {
    if (agentParticipant && characterCard) {
      const characterCardData = JSON.stringify({ 
        character: characterCard 
      });
      send(new TextEncoder().encode(characterCardData), { reliable: true, topic: "character_card", });
    }
  }, [agentParticipant]);

  useEffect(() => {
    const allMessages = [];
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
        id: msg.id,
        timestamp: msg?.timestamp,
        isSelf: isSelf,
        highlight_word_count: msg.highlight_word_count,
        name,
        message: msg.message,
        parent_id: msg.parent_id,
        alt_ids: msg.alt_ids,
        conversation_id: msg.conversation_id,
        character_id: msg.character_id,
        model: msg.model,
        type: msg.type
      });
    }
    setMessages(allMessages);
  }, [chatMessages, localParticipant, agentParticipant]);

  const videoTileContent = useMemo(() => {
    const videoFitClassName = `object-${videoFit}`;
    return (
      <div className="flex flex-col w-full grow text-gray-950 rounded-sm border border-gray-800 relative">
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

  // useEffect(() => {
  //   if (!fgRef.current) return; // Guard clause if ref is not set yet

  //   const fg = fgRef.current;

  //   // Deactivate existing forces
  //   fg.d3Force('center', d3.forceCenter());
  //   // fg.d3Force('charge', null);

  //   // Add collision and bounding box forces
  //   fg.d3Force('collide', d3.forceCollide(2));
  //   fg.d3Force('box', () => {
  //     const SQUARE_HALF_SIDE = 1 * 2;

  //     graphData.nodes.forEach(node => {
  //       const x = node.x || 0, y = node.y || 0;

  //       // bounce on box walls
  //       if (Math.abs(x) > SQUARE_HALF_SIDE) { node.vx *= -1; }
  //       if (Math.abs(y) > SQUARE_HALF_SIDE) { node.vy *= -1; }
  //     });
  //   });

  // }, [fgRef, graphData.nodes]); 

  const graphTileContent = () => {

    const hasData = graphData.nodes && graphData.nodes.length > 0;
  
    const handleClick = (node: any) => {
      handleCommand("alt", node.id);
      console.log(`Clicked node:`, node);
    };


  
    return (
      <div className="dag-container">
        {hasData ? (
          <ForceGraph2D
            graphData={graphData}
            onNodeClick={handleClick}
            linkVisibility={true}
            linkWidth={5}
            linkCanvasObject={(link, ctx, globalScale) => {
              const start = link.source;
              const end = link.target;
              // Draw the link line
              ctx.beginPath();
              if (start && typeof start === 'object' && end && typeof end === 'object') {
                ctx.moveTo(start.x || 0, start.y || 0);
                ctx.lineTo(end.x || 0, end.y || 0);
              }
              ctx.strokeStyle = '#DA70D6'; // Custom link color
              ctx.stroke();
            }}
            linkDirectionalArrowLength={5}
            nodeRelSize={25}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const maxBoxWidth = 100; // Maximum box width
              const maxBoxHeight = 50; // Maximum box height
              const fontSize = 12 / globalScale;
              ctx.font = `${fontSize}px Sans-Serif`;
              const text = String(node.messages);
              const words = text.split(' ');
              let line = '';
              let lines = [];
              let y = (node.y || 0) - maxBoxHeight / 2 + fontSize;
  
              // Set fill style for background color of the text box
              ctx.fillStyle = node.type ? '#8A2BE2' : '#4B0082';
              // Draw the background rectangle with a border
              ctx.fillRect((node.x || 0) - maxBoxWidth / 2, (node.y || 0) - maxBoxHeight / 2, maxBoxWidth, maxBoxHeight);
              // Set stroke style for border and draw the border
              ctx.strokeStyle = '#DA70D6'; // Border color
              ctx.lineWidth = 2; // Border width
              ctx.strokeRect((node.x || 0) - maxBoxWidth / 2, (node.y || 0) - maxBoxHeight / 2, maxBoxWidth, maxBoxHeight);
  
              ctx.fillStyle = 'white';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'top';
  
              words.forEach((word) => {
                const testLine = line + word + ' ';
                const metrics = ctx.measureText(testLine);
                const testWidth = metrics.width;
                if (testWidth > maxBoxWidth && line !== '') {
                  lines.push(line);
                  line = word + ' ';
                } else {
                  line = testLine;
                }
              });
  
              lines.push(line);
  
              for (let i = 0; i < lines.length && y + fontSize <= (node.y || 0) + maxBoxHeight / 2; i++) {
                ctx.fillText(lines[i], (node.x || 0), y);
                y += fontSize;
              }
  
              if (y + fontSize > (node.y || 0) + maxBoxHeight / 2) {
                const ellipsis = '...';
                ctx.fillText(ellipsis, node.x || 0, (node.y || 0) + maxBoxHeight / 2 - fontSize);
              }
            }}
            nodeLabel={(node) => node.messages}
            // d3Force="charge" // Use the charge force for repulsion
            // d3ReheatSimulation={true} // Reheat the simulation on data change
            // d3AlphaDecay={0.0002} // Adjust simulation cooling rate
            // d3VelocityDecay={0.0002} // Adjust nodes' movement inertia
            // d3ForceConfig={{
            //   charge: { strength: -1200000 }, // Negative value for repulsion
            //   collision: { radius: 100 }, // Collision detection with specified radius
            //   link: { distance: 100000000, strength: 1000000 }, // Minimum link distance
            // }}
            cooldownTime={Infinity}
            d3AlphaDecay={0.2}
            d3VelocityDecay={0.2}
            ref={fgRef}
          />
        ) : (
          <div>Loading graph data...</div>
        )}
      </div>
    );
  };

  // const graphTileContent = () => {
  //   // Check if graphData has nodes
  //   const hasData = graphData.nodes && graphData.nodes.length > 0;
  
  //   const handleClick = (node: any) => {
  //     // Example interaction handler - adjust as needed
  //     handleCommand("alt", node.id);
  //     console.log(`Clicked node:`, node);
  //   };
  
  //   return (
  //     <div className="dag-container">
  //       {hasData ? (
  //         <ForceGraph2D
  //           graphData={graphData}
  //           onNodeClick={handleClick}
  //           linkVisibility={true}
  //           linkWidth={5}
  //           linkDirectionalArrowLength={5}
  //           nodeCanvasObject={(node, ctx, globalScale) => {
  //             const label = String(node.id);
  //             const msg = String(node.messages)
  //             const fontSize = 12/globalScale;
  //             ctx.font = `${fontSize}px Sans-Serif`;
  //             ctx.textAlign = 'center';
  //             ctx.textBaseline = 'middle';
  //             ctx.fillStyle = node.type ? 'blue' : 'red';
  //             ctx.fillText(msg, node.x || 0, node.y || 0);
  //           }}
  //           nodeLabel={(node) => node.messages} // Adjust according to your data structure
  //         />
  //       ) : (
  //         <div>Loading graph data...</div> // Placeholder for empty or loading state
  //       )}
  //     </div>
  //   );
  // };

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
        onCommand={handleCommand}
      />
    );
  }, [messages, themeColor, sendChat]);

  const settingsTileContent = useMemo(() => {
    return (
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
        <ConfigurationPanelItem title="Room Name">
          <div className="flex gap-2">
            <p className="w-full p-2 rounded text-violet-500">{room}</p>
            {/* <input
            type="text"
            value={room}
            onChange={(e) => setroom(e.target.value)}
            className="w-full p-2 border border-gray-800 rounded bg-black text-violet-500"
            placeholder="Enter room name"
          />
          <Button
            accentColor={'violet'}
            className="w-half"
            onClick={() => setroom(room)}
          >
            Update Room
          </Button> */}
            <Button
              accentColor={"violet"}
              className="w-half"
              onClick={() =>
                navigator.clipboard.writeText(
                  `https://purfect.me/talk/${characterId}?room=${room}`,
                )
              }
            >
              Copy Invite Link
            </Button>
          </div>
        </ConfigurationPanelItem>
        {/* <ConfigurationPanelItem title="Character Prompt">
          <form onSubmit={handleFormSubmit}>
            <textarea
              ref={characterPromptRef}
              className="w-full h-full p-2 border border-gray-800 rounded bg-black text-violet-500"
              rows={4}
              defaultValue={characterCard?.prompt}
              placeholder="Enter the system prompt for the agent"
            />
            <Button
              accentColor={'violet'}
              className="w-half my-2"
              type="submit"
            >
              Update Prompt
            </Button>
          </form>
        </ConfigurationPanelItem> */}
      </div>
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

// const captureScript = `
// <script>
//   window.addEventListener('message', (event) => {
//     if (event.data === 'captureImage') {
//       html2canvas(document.body).then((canvas) => {
//         const dataURL = canvas.toDataURL('image/png');
//         window.parent.postMessage(dataURL, '*');
//       }).catch((error) => console.error('Error capturing image:', error));
//     }
//   }, false);
// </script>
// `;

// const updatedIframeContent = useMemo(() => {
//   // Ensure html2canvas is available in the iframe
//   const html2canvasScript = '<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.3.2/html2canvas.min.js"></script>';
//   // Append the html2canvas script and the capture script to the iframe content
//   return `${iframeContent}${html2canvasScript}${captureScript}`;
// }, [iframeContent]);

  // const captureIframeAsImage = async () => {
  //   if (iframeRef.current) {
  //     console.log("UPDATED IMAGE");
  //     const iframe = iframeRef.current;
  //     const iframeContent = iframe.contentDocument || iframe.contentWindow?.document;
  //     if (iframeContent) {
  //       try {
  //         const canvas = await html2canvas(iframeContent.body);
  //         const dataURL = canvas.toDataURL('image/png');
  //         setCanvasImageUrl(dataURL);
  //       } catch (error) {
  //         console.error('Error capturing iframe image:', error);
  //       }
  //     }
  //   }
  // };

  // const captureIframeAsImage = () => {
  //   if (iframeRef.current) {
  //     const iframe = iframeRef.current;
  //     const iframeWindow = iframe.contentWindow;
  
  //     const handleMessage = (event: MessageEvent) => {
  //       if (typeof event.data === 'string' && event.data.startsWith('data:image/png;base64,')) {
  //         setCanvasImageUrl(event.data);
  //         window.removeEventListener('message', handleMessage);
  //       }
  //     };
  
  //     window.addEventListener('message', handleMessage);
  //     iframeWindow?.postMessage('captureImage', '*');
  //   }
  // };

  // useEffect(() => {
  //   const completePrompt = sdPrompt
  //   if (roomState === ConnectionState.Connected && canvasImageUrl && createNewFrame) {
  //     connection.send({
  //       prompt: completePrompt,
  //       sync_mode: true,
  //       image_url: canvasImageUrl,
  //       strength: 0.3,
  //       num_inference_steps: 2,
  //       seed: 42,
  //     });
  //     setCreateNewFrame(false);
  //   }
  // }, [roomState, canvasImageUrl, createNewFrame]);
   
  // const connection = fal.realtime.connect("fal-ai/lcm-sd15-i2i", {
  //   connectionKey: 'canvas-diffusion',
  //   clientOnly: true,
  //   onResult: (result) => {
  //     setImageUrl(() => result.images[0].url);
  //     setCreateNewFrame(true);      
  //   },
  //   onError: (error) => {
  //     console.error(error);
  //   },
  // });

  // useEffect(() => {
  //   const interval = setInterval(captureIframeAsImage, 100); // Capture every 5 seconds
  //   return () => {
  //     clearInterval(interval);
  //   };
  // }, []);

  const sdContent = useMemo(() => (
    <div className="w-full h-full bg-black flex items-center justify-center">
      { imageUrl ? (
        <img
        src={imageUrl || undefined}
        alt="Generated Image"
          className="max-w-full max-h-full object-contain"
        />
      ) : (
        <div className="text-white">Loading image...</div>
      )}
    </div>
  ), [imageUrl]);

  const canvasTileContent = useMemo(() => {
    return (
      <iframe
        ref={iframeRef}
        srcDoc={iframeContent}
        title="Background"
        sandbox="allow-scripts allow-same-origin"
        frameBorder="0"
        className="w-full h-full bg-black hide-scrollbar"
        style={{
          overflow: "hidden",
          scrollbarWidth: "none", // For Firefox
          msOverflowStyle: "none", // For Internet Explorer and Edge
        }}
      />
    );
  }, [iframeContent]);

  let mobileTabs: PlaygroundTab[] = [];
  if (outputs?.includes(PlaygroundOutputs.Video) && displayVideoTile) {
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

  if (outputs?.includes(PlaygroundOutputs.Audio) && displayAudioTile) {
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
        {settingsTileContent}
      </PlaygroundTile>
    ),
  });

  mobileTabs.push({
    title: "Canvas",
    content: (
      <PlaygroundTile
        className="w-full h-full overflow-y-auto flex"
        childrenClassName="h-full grow items-start"
      >
        {canvasTileContent}
      </PlaygroundTile>
    ),
  });

  mobileTabs.push({
    title: "SD",
    content: (
      <div className="flex flex-col h-full">
        <div
          className="w-full h-1/2 overflow-y-auto flex"
        >
          {canvasTileContent}
        </div>
        
        <div
          className="h-1/2 grow flex"
        >
          {sdContent}
        </div>
      </div>
    ),
  });

  mobileTabs.push({
    title: "Game",
    content: (
      <div className="flex flex-col h-full">
        <div className="w-full h-1/2 overflow-y-auto flex">
          {canvasTileContent}
        </div>

        <div className="h-1/2 grow flex">{chatTileContent}</div>
      </div>
    ),
  });

  return (
    <>
          {roomState === ConnectionState.Connected ? (
<>
      <PlaygroundHeader
        title={title}
        logo={logo}
        githubLink={githubLink}
        height={headerHeight}
        accentColor={themeColor}
        connectionState={roomState}
        onConnectClicked={() =>
          onConnect(roomState === ConnectionState.Disconnected as ConnectionState)
        }
      />
      <div
        className={`flex gap-4 py-4 grow w-full selection:bg-${themeColor}-900`}
        style={{ height: `calc(100% - ${headerHeight}px)` }}
      >
        {['offline', 'starting'].includes(agentState) ? ( 
          <LoadingScreen/>
          ):(
          <>
            <div className="flex flex-col grow basis-1/2 gap-4 h-full lg:hidden">
              <PlaygroundTabbedTile
                className="h-full"
                tabs={mobileTabs}
                initialTab={mobileTabs.length - 1}
              />
            </div>
            {outputs?.includes(PlaygroundOutputs.Chat) && (
              <PlaygroundTile
                className="h-full grow basis-3/4 hidden lg:flex"
              >
                {chatTileContent}
              </PlaygroundTile>
            )}
            <div className="flex-col grow basis-1/4 gap-4 h-full hidden lg:flex w-1/2">
              <PlaygroundTile
                padding={false}
                backgroundColor="gray-950"
                className="w-full h-1/4 grow"
                childrenClassName="justify-center"
              >
                {settingsTileContent}
              </PlaygroundTile>
              {/* {outputs?.includes(PlaygroundOutputs.Video) && (
            <PlaygroundTile
              title="Video"
              className="w-full h-full grow"
              childrenClassName="justify-center"
            >
              {videoTileContent}
            </PlaygroundTile>
          )} */}
              {/* {outputs?.includes(PlaygroundOutputs.Audio) && (
            <PlaygroundTile
              title="Audio"
              className="w-full h-1/2 grow"
              childrenClassName="justify-center"
            >
              {audioTileContent}
            </PlaygroundTile>
          )} */}
              <PlaygroundTile
                className="w-full h-full overflow-y-auto flex"
                childrenClassName="h-full grow items-start"
              >
                {graphTileContent()}
              </PlaygroundTile>
            </div>
          </>
        )}
      </div>
</>
      ) : (
        <ConnectionModal
          isOpen={
            roomState === ConnectionState.Disconnected ||
            roomState === ConnectionState.Connecting
          }
          onClose={() => {
            /* handle modal close logic here */
          }}
          onConnect={() => onConnect(true)}
          themeColor={themeColor}
          headerHeight={headerHeight}
          agentState={agentState}
        />
      )}
    </>
  );
}
