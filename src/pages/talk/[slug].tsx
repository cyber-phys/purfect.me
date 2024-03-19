import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

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

export default function Page() {
  const router = useRouter();
  const { slug } = router.query;
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCharacter = async () => {
      if (slug) {
        try {
          const response = await fetch(`/api/get-character?id=${slug}`);
          if (response.ok) {
            const data: Character = await response.json();
            setCharacter(data);
            console.log(data);
          } else {
            setError('Failed to fetch character');
          }
        } catch (error) {
          setError('An error occurred while fetching the character');
        }
      }
      setLoading(false);
    };

    fetchCharacter();
  }, [slug]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="dark text-foreground text-violet-500">{error}</p>;
  }

  if (!character) {
    return <p className="dark text-foreground text-violet-500">Character not found</p>;
  }

  return (
    <div className="dark text-foreground bg-background">
      <p>{character.name}</p>
      <p>{character.prompt}</p>
      <p>Voice: {character.voice}</p>
      <p>Base Model: {character.baseModel}</p>
      <p>Video Transcription Enabled: {character.isVideoTranscriptionEnabled ? 'Yes' : 'No'}</p>
      <p>Video Transcription Continuous: {character.isVideoTranscriptionContinuous ? 'Yes' : 'No'}</p>
      <p>Video Transcription Model: {character.videoTranscriptionModel}</p>
      <p>Video Transcription Interval: {character.videoTranscriptionInterval}</p>
      <h2 className="text-xl text-violet-500">Starting Messages:</h2>
      <ul>
        {character.startingMessages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </div>
  );
}