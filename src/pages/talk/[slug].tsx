import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface Character {
  name: string;
  prompt: string;
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
      <h1 className="text-2xl text-violet-500">{character.name}</h1>
      <p>{character.prompt}</p>
    </div>
  );
}