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
        <img src={character.image || "/purfectme.png"} alt={character.name} />
        <h2>{character.name}</h2>
        <p>{character.bio}</p>
        <button className="search-btn">Chat Now</button>
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

  // return (
  //   <>
  //     <Head>
  //       <title>Purfect Me</title>
  //       <meta name="description" content="Quantum multiverse link to your desired reality" />
  //       <link rel="icon" href="/favicon.ico" />
  //     </Head>
  //     <div className="flex">

  //       <div className="bg-purfect-stone-600 text-black font-mono min-h-screen flex flex-col">
  //         <header className="bg-purfect-stone-600 p-5 text-center">
  //           <h1 className="text-2xl font-bold">Purfect Me</h1>
  //         </header>
  //         <main className="flex-grow">
  //           <div className="">
  //             <div className="flex justify-start items-center mb-0 border-5 border-purfect-lime-300 bg-purfect-lime-300 rounded-r-lg w-1/2">
  //               <button onClick={handleCreateNewCharacter} className="bg-amber-500 py-2 px-4 rounded font-mono text-base">
  //                 Create New Character
  //               </button>
  //             </div>
  //             <div className="flex justify-start items-center mb-5 border-5 border-purfect-lime-300 bg-purfect-lime-300 rounded-r-lg w-3/4">
  //               <input
  //                 type="text"
  //                 placeholder="Search characters..."
  //                 value={searchQuery}
  //                 onChange={(e) => setSearchQuery(e.target.value)}
  //                 className="w-full p-2 border-2 border-indigo-800 rounded font-mono text-base"
  //               />
  //             </div>
  //           </div>
  //           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
  //             {filteredCharacters.map((character) => (
  //               <RetroCard key={character.id} character={character} />
  //             ))}
  //           </div>
  //           <div className="mt-10">
  //             <h2 className="text-xl font-bold">About Purfect Me</h2>
  //             <p className="text-base leading-relaxed">
  //               Purfect Me is a chatbot role-playing site that allows you to engage in immersive conversations with a variety of characters. Explore different personalities and embark on exciting adventures in a quantum multiverse.
  //             </p>
  //           </div>
  //         </main>
  //         <footer className="bg-pink-400 p-5 text-center">
  //           <p className="text-sm">&copy; {new Date().getFullYear()} Purfect Me. All rights reserved.</p>
  //         </footer>
  //       </div>
  //       <PlayerBar />

  //     </div>
  //   </>
  // );

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
        <h1><i className="fa-solid fa-shapes"></i>Purfect Me</h1>
      </header>

      <main>
        <div className="intro">
        <p>Purfect Me is a chatbot role-playing site that allows you to engage in immersive conversations with a variety of characters. Explore different personalities and embark on exciting adventures in a quantum multiverse.</p>
        </div>

        <form>
          <input type="search" placeholder="Search characters..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <button type="submit" className="search-btn"><i className="fa-solid fa-search"></i></button>
        </form>

        <div className="create-character">
          <a href="https://character.ai/character_creator">
            <i className="fa-solid fa-wand-magic-sparkles"></i> Conjure Your Own Character
          </a>
        </div>

        <div className="character-grid">
          {filteredCharacters.map((character) => (
            <RetroCard key={character.id} character={character} />
          ))}
        </div>
      </main >
    </>
  );
}
