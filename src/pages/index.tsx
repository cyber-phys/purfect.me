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
<<<<<<< HEAD
        <div className="flex flex-col min-h-screen bg-black">

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
<<<<<<< HEAD
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
=======
      <header className="bg-violet-500 text-white py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">Purfect Me</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 flex-grow text-white">
        <h2 className="text-3xl font-bold mb-4">Explore Characters</h2>
        <input
          type="text"
          placeholder="Search characters..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCharacters.map((character) => (
            <Card key={character.id} isFooterBlurred className="w-full h-[300px]">
              <CardHeader className="absolute z-10 top-1 flex-col items-start">
                <h4 className="text-black font-medium text-2xl">{character.name}</h4>
              </CardHeader>
              <Image
                removeWrapper
                alt={character.name}
                className="z-0 w-full h-full scale-125 -translate-y-6 object-cover"
                src={character.image}
              />
              <CardFooter className="absolute bg-white/30 bottom-0 border-t-1 border-zinc-100/50 z-10 justify-between">
                <div>
                  <p className="text-black text-tiny">{character.description}</p>
                </div>
                <Button className="text-tiny" color="primary" radius="full" size="sm">
                  Chat Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">About Purfect Me</h2>
          <p>
            Purfect Me is a chatbot role-playing site that allows you to engage
            in immersive conversations with a variety of characters. Explore
            different personalities and embark on exciting adventures in a
            quantum multiverse.
          </p>
        </div>
      </main>
      <footer className="bg-gray-100 py-4 mt-auto bg-gray-500">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-600">
            &copy; {new Date().getFullYear()} Purfect Me. All rights reserved.
          </p>
        </div>
      </footer>
>>>>>>> c6f584c (feat: Redesign Purfect Me landing page)
=======
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
>>>>>>> 6072623 (WIP: Refactor index page and styles for retro theme)
      </div>
    </>
  );
}
