import { Inter } from "next/font/google";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { Character } from "@/lib/types";

const inter = Inter({ subsets: ["latin"] });

const RetroCard = ({ character }: { character: Character }) => {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/talk/${character.id}`);
  };

  return (
    <div className="retro-card" onClick={handleCardClick}>
      {/* <img src={character.image} alt={character.name} className="retro-card-image" /> */}
      <div className="retro-card-content">
        <h3 className="retro-card-title">{character.name}</h3>
        <p className="retro-card-description">{character.bio}</p>
        <button className="retro-card-button">Chat Now</button>
      </div>
    </div>
  );
};

export default function Page() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);

  const filteredCharacters = characters.filter((character: Character) =>
    character.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  useEffect(() => {
    async function fetchCharacters() {
      try {
        const response = await fetch("/api/get-character-list");
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setCharacters(data);
        } else {
          console.error("Data is not an array:", data);
        }
      } catch (error) {
        console.error("Failed to fetch characters:", error);
      }
    }

    fetchCharacters();
  }, []);

  const handleCreateNewCharacter = () => {
    router.push("/create");
  };

  return (
    <>
      <Head>
        <title>Purfect Me</title>
        <meta
          name="description"
          content="Quantum multiverse link to your desired reality"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta property="og:image" content="https://purfect.me/purfectme.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header>
        <h1><i className="fa-solid fa-shapes"></i> Y2K Character Cards</h1>
        <form>
          <input type="search" placeholder="Search characters..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <button type="submit" className="search-btn"><i className="fa-solid fa-search"></i></button>
        </form>
      </header>

      <main>
        <div className="intro">
          <p>Welcome to the wild and wacky world of Y2K Character Cards! Meet our cast of quirky AI characters, each one more charmingly eccentric than the last. Click a card to start chatting and embark on a zany adventure into the unknown!</p>
        </div>

        <div className="create-character">
          <a href="https://character.ai/character_creator">
            <i className="fa-solid fa-wand-magic-sparkles"></i> Conjure Your Own Character
          </a>
        </div>

        <div className="character-grid">
          {characters.map((character) => (
            <div className="card" key={character.id}>
              <div className="card-content">
                <img src={character.image} alt={character.name} />
                <h2>{character.name}</h2>
                <p>{character.bio}</p>
                <a href={`https://character.ai/chat?char=${character.name}`}>Chat Now</a>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
