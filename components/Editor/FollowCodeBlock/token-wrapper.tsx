import { Token, TokenTypes } from "@/lib/follow-parser";
import { cn } from "@/lib/utils";

type TokenWrapperProps = {
  token: Token;
  textareaRow: number;
  textareaCol: number;
};

function getClassName(token: Token) {
  switch (token.type) {
    case TokenTypes.WORD:
    case TokenTypes.SEP:
    case TokenTypes.IGNORE:
      return "text-follow-text-light dark:text-follow-text-dark";
    case TokenTypes.KEY:
      return "text-follow-keyword-light dark:text-follow-keyword-dark";
    case TokenTypes.COMMENT:
      return "text-follow-comment-light dark:text-follow-comment-dark";
    case TokenTypes.TYPENAME:
      return "text-follow-type-light dark:text-follow-type-dark";
    case TokenTypes.ARGNAME:
      return "text-follow-param-light dark:text-follow-param-dark";
    case TokenTypes.TERMNAME:
      return "text-follow-term-light dark:text-follow-term-dark";
    case TokenTypes.CONSTNAME:
      return "text-follow-number-light dark:text-follow-number-dark";
    case TokenTypes.AXIOMNAME:
    case TokenTypes.THMNAME:
      return "text-follow-function-light dark:text-follow-function-dark";
  }
}

function inTokenRange(token: Token, row: number, col: number) {
  const { start, end } = token.range;
  console.log(start.line, start.character, end.line, end.character, row, col);
  if (row < start.line || (row === start.line && col < start.character)) {
    return false;
  }
  if (row > end.line || (row === end.line && col > end.character)) {
    return false;
  }
  return true;
}

export function TokenWrapper({
  token,
  textareaRow,
  textareaCol,
}: TokenWrapperProps) {
  return (
    <span
      className={cn(
        "relative",
        getClassName(token),
        token.error && "bg-red-300 dark:bg-red-700"
      )}
    >
      {token.content}
      {token.comment && textareaRow !== token.range.start.line && (
        <span className="absolute -top-[1] left-0 z-[1] bg-gray-200 dark:bg-gray-800 w-[60vw] text-green-800 dark:text-green-400">
          {token.comment}
        </span>
      )}
    </span>
  );
}
