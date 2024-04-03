import { Inter } from "next/font/google";
import Head from "next/head";
import { useState } from "react";
import { useRouter } from 'next/router';

const inter = Inter({ subsets: ["latin"] });

interface Character {
  id: string;
  name: string;
  image: string;
  description: string;
}

const characters: Character[] = [
  {
    id: "5a277c5d-a660-4b77-8dc2-4f7c2d7bdaf6",
    name: "Purfect Operator",
    image: "/character1.png",
    description: "Your purfect feline friend",
  },
  {
    id: "2",
    name: "World Sim",
    image: "/character2.png",
    description: "Claud world sim",
  },
  // Add more characters...
];

const RetroCard = ({ character }: { character: Character }) => {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/talk/${character.id}`);
  };

  return (
    <div className="retro-card" onClick={handleCardClick}>
      <img src={character.image} alt={character.name} className="retro-card-image" />
      <div className="retro-card-content">
        <h3 className="retro-card-title">{character.name}</h3>
        <p className="retro-card-description">{character.description}</p>
        <button className="retro-card-button">Chat Now</button>
      </div>
    </div>
  );
};

export default function Page() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const filteredCharacters = characters.filter((character) =>
    character.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNewCharacter = () => {
    router.push('/create');
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
        <meta
          property="og:image"
          content="https://purfect.me/purfectme.png"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="retro-container">
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
          <meta
            property="og:image"
            content="https://purfect.me/purfectme.png"
          />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <header className="retro-header">
          <h1 className="retro-title">Purfect Me</h1>
        </header>
        <main className="retro-main">
          <div className="retro-main-header">
            <h2 className="retro-subtitle">Explore Characters</h2>
            <button
              onClick={handleCreateNewCharacter}
              className="retro-button retro-button-create"
            >
              Create New Character
            </button>
          </div>
          <input
            type="text"
            placeholder="Search characters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="retro-input"
          />
          <div className="retro-card-grid">
            {filteredCharacters.map((character) => (
              <RetroCard key={character.id} character={character} />
            ))}
          </div>
          <div className="retro-about">
            <h2 className="retro-subtitle">About Purfect Me</h2>
            <p className="retro-text">
              Purfect Me is a chatbot role-playing site that allows you to engage
              in immersive conversations with a variety of characters. Explore
              different personalities and embark on exciting adventures in a
              quantum multiverse.
            </p>
          </div>
        </main>
        <footer className="retro-footer">
          <p className="retro-footer-text">
            &copy; {new Date().getFullYear()} Purfect Me. All rights reserved.
          </p>
        </footer>
      </div>
    </>
  );
}
