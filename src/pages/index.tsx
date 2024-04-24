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
    <div className="card" onClick={handleCardClick} key={character.id}>
      <div className="card-content">
        {/* <img src={character.image || "/purfectme.png"} alt={character.name} /> */}
        <img src={"/purfectme.png"} alt={character.name} />
        <h2>{character.name}</h2>
        <p>{character.bio}</p>
        <button className="pm-index-search-btn">Chat Now</button>
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
    // Add the class to the body tag
    document.body.classList.add('pm-index-body');
    document.body.classList.add('full-background-page');


    // Cleanup function to remove the class when the component unmounts
    return () => {
      document.body.classList.remove('pm-index-body');
      document.body.classList.remove('full-background-page');

    };
  }, []);

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
      <header className="pm-index-header">
        <h1 className="pm-index-h1"><i className="fa-solid fa-shapes"></i>Purfect Me</h1>
      </header>

      <main>
        <div className="p-4">
        <div className="pm-index-intro">
        <p>Purfect Me is a chatbot role-playing site that allows you to engage in immersive conversations with a variety of characters. Explore different personalities and embark on exciting adventures in a quantum multiverse.</p>
        </div>
        
        <form className="pm-index-form">
          <input type="search" className="pm-index-search-input" placeholder="Search characters..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <button type="submit" className="pm-index-search-btn"><i className="fa-solid fa-search"></i></button>
        </form>

        <div className="create-character" onClick={handleCreateNewCharacter}>
          <a>
            <i className="fa-solid fa-wand-magic-sparkles"></i> Conjure Your Own Character
          </a>
        </div>

        <div className="character-grid">
          {filteredCharacters.map((character) => (
            <RetroCard key={character.id} character={character} />
          ))}
        </div>
        </div>
      </main >
    </>
  );
}
