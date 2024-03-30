type ChatMessageProps = {
  message: string;
  accentColor: string;
  name: string;
  isSelf: boolean;
  highlight_word_count: number;
};

export const ChatMessage = ({
  name,
  message,
  accentColor,
  isSelf,
  highlight_word_count,
}: ChatMessageProps) => {
  const words = message.split(/(\s+)/);
  let highlightedWords = 0;

  const coloredMessage = words.map((word, index) => {
    if (word.trim() === '') {
      return <span key={index}>{word}</span>;
    }

    highlightedWords++;

    if (isSelf) {
      return <span key={index} className="text-gray-300">{word}</span>;
    } else {
      return (
        <span
          key={index}
          className={`${
            highlightedWords <= highlight_word_count
              ? `text-${accentColor}-500`
              : `text-${accentColor}-800`
          }`}
        >
          {word}
        </span>
      );
    }
  });

  return (
    <div className="flex flex-col gap-1">
      <div
        className={`text-${
          isSelf ? "gray-700" : accentColor + "-800 text-ts-" + accentColor
        } uppercase text-xs`}
      >
        {name}
      </div>
      <div
        className={`pr-4 text-sm ${isSelf ? "" : "drop-shadow-" + accentColor}`}
      >
        {coloredMessage}
      </div>
    </div>
  );
};