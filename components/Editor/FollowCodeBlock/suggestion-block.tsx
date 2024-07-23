import { Suggestion } from "@/lib/follow-parser";
import { cn } from "@/lib/utils";

interface SuggestionBlockProps {
  suggestions: Suggestion[];
  handleSuggestions: (s: Suggestion) => () => void;
  textareaRow: number;
  textareaCol: number;
  choosedSuggestion: number;
  className?: string;
}

export function SuggestionBlock({
  suggestions,
  handleSuggestions,
  textareaRow,
  textareaCol,
  className,
  choosedSuggestion,
}: SuggestionBlockProps) {
  return (
    suggestions.length > 0 && (
      <div className="flex h-full w-full my-1">
        <ul className="w-[45%] p-0 m-0">
          {suggestions.map((suggestion, index) => {
            return (
              <li key={index} className="p-0 m-0">
                <div
                  onClick={handleSuggestions(suggestion)}
                  className={cn(
                    "pl-2 m-0 rounded-none w-full justify-start hover:underline",
                    index === choosedSuggestion &&
                      "bg-blue-200 dark:bg-yellow-900"
                  )}
                >
                  {suggestion.newText}
                </div>
              </li>
            );
          })}
        </ul>
        {choosedSuggestion >= 0 && choosedSuggestion < suggestions.length && (
          <pre className="w-[55%] p-2 border-solid rounded-none border-2 border-gray-800 bg-blue-200 dark:bg-yellow-900">
            <code>{suggestions[choosedSuggestion].doc}</code>
          </pre>
        )}
      </div>
    )
  );
}
