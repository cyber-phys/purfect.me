import { AccessToken } from "livekit-server-sdk";
import type { AccessTokenOptions, VideoGrant } from "livekit-server-sdk";
import { TokenResult } from "../../lib/types";

export const config = {
  runtime: 'edge',
};

const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;

const createToken = (userInfo: AccessTokenOptions, grant: VideoGrant) => {
  const at = new AccessToken(apiKey, apiSecret, userInfo);
  at.addGrant(grant);
  return at.toJwt();
};

const roomPattern = /\w{4}\-\w{4}/;

export default async function handleToken(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roomName = searchParams.get('roomName');
    const identity = searchParams.get('identity') || undefined;
    const name = searchParams.get('name') || undefined;
    const metadata = searchParams.get('metadata') || undefined;

    if (!identity || !roomName) {
      return new Response('identity and roomName have to be specified in the request', { status: 403 });
    }

    if (!apiKey || !apiSecret) {
      return new Response('Environment variables aren\'t set up correctly', { status: 500 });
    }

    // enforce room name to be xxxx-xxxx
    // this is simple & naive way to prevent user from guessing room names
    // please use your own authentication mechanisms in your own app
    if (!roomName.match(roomPattern)) {
      return new Response('Invalid roomName', { status: 400 });
    }

    const grant: VideoGrant = {
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
    };

    const token = await createToken({ identity, name, metadata }, grant);
    const result: TokenResult = {
      identity,
      accessToken: token,
    };

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (e) {
    return new Response((e as Error).message, { status: 500 });
  }
}