"use client";
import { CompileInfo, Suggestion, TextEdit, Token } from "@/lib/follow-parser";
import { cn } from "@/lib/utils";
import {
  ChangeEvent,
  FormEventHandler,
  KeyboardEventHandler,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { TokenWrapper } from "./token-wrapper";
import { ErrorBlock } from "./error-block";
import { SuggestionBlock } from "./suggestion-block";
import { ProofStateBlock } from "./proof-state-block";
import { Input } from "@/components/ui/input";
import { useParams } from "next/navigation";
import { SpacesContext } from "@/components/providers/SpacesProvider";

interface FollowCodeBlockProps {
  blockId: string;
  content: string | null;
  updateContent: (newContent: string) => void;
  className?: string;
  placeholder?: string;
}

export function FollowCodeBlock({
  blockId,
  content,
  updateContent,
  className,
  placeholder,
}: FollowCodeBlockProps) {
  const { spaceId, noteId } = useParams<{
    spaceId?: string;
    noteId?: string;
  }>();
  const context = useContext(SpacesContext);

  const [compileInfo, setCompileInfo] = useState<CompileInfo>({
    cNodes: [],
    errors: [],
    tokens: [],
    suggestions: [],
  });
  const [hasChanged, setChanged] = useState<boolean>(false);

  const [textareaRow, setTextareaRow] = useState<number>(-1);
  const [textareaCol, setTextareaCol] = useState<number>(-1);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);

  const [choosedSuggestion, setChoosedSuggestion] = useState<number>(-1);

  const [renameSource, setRenameSource] = useState<string>("");

  const modifiedCode = (code: string) => {
    if (code === undefined || code.length === 0) {
      return "\n";
    }
    if (code.at(-1) === "\n") {
      return code + "\n";
    }
    return code;
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    const highlight = highlightRef.current;
    if (textarea === null || highlight === null) {
      return;
    }
    textarea.style.height = "1px";
    textarea.style.height = textarea.scrollHeight + "px";
    highlight.style.height = textarea.style.height;
  };

  useEffect(() => {
    if (compileInfo.suggestions.length > 0) {
      setChoosedSuggestion(0);
    } else {
      setChoosedSuggestion(-1);
    }
  }, [compileInfo]);

  useEffect(() => {
    if (spaceId && noteId && blockId && context) {
      const compileInfo = context.compile(
        spaceId,
        noteId,
        blockId,
        modifiedCode(content || "")
      );
      setCompileInfo(compileInfo);
    }
    adjustTextareaHeight();
    setChanged(true);
  }, [content]);

  useEffect(() => {
    const textarea = textareaRef.current;
    const highlight = highlightRef.current;
    if (textarea === null || highlight === null) {
      return;
    }
    const syncScroll = () => {
      highlight.scrollTop = textarea.scrollTop;
      highlight.scrollLeft = textarea.scrollLeft;
    };
    textarea.addEventListener("scroll", syncScroll);

    return () => {
      textarea.removeEventListener("scroll", syncScroll);
    };
  }, []);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const code = event.target.value;
    updateContent(event.target.value);
  };
  const handleContentBlur = () => {
    if (hasChanged) {
      setChanged(false);
    }
    setTextareaCol(-1);
    setTextareaRow(-1);
  };
  const handleSelect = (event: React.MouseEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const { selectionStart } = textarea;
      const text = textarea.value.substring(0, selectionStart);
      const lines = text.split("\n");
      const line = lines.length - 1;
      const column = lines[lines.length - 1].length;
      setTextareaCol(column);
      setTextareaRow(line);
    }
  };

  const handleRename: FormEventHandler<HTMLInputElement> = (event) => {
    let result = "";
    for (const token of compileInfo.tokens) {
      if (token.content === renameSource) {
        result += event.currentTarget.value;
      } else {
        result += token.content;
      }
    }
    setRenameSource("");
    updateContent(result);
  };

  const handleSuggestion = (suggestion: Suggestion) => {
    return () => {
      if (content) {
        if (
          suggestion.additionalTextEdits === undefined ||
          suggestion.additionalTextEdits.length === 0
        ) {
          updateContent(
            content.substring(0, suggestion.range.start.offset) +
              suggestion.newText +
              content.substring(suggestion.range.end.offset)
          );
          requestAnimationFrame(() => {
            if (textareaRef.current) {
              textareaRef.current.focus();
              textareaRef.current.selectionStart =
                textareaRef.current.selectionEnd =
                  suggestion.range.start.offset + suggestion.newText.length;
            }
          });
        } else {
          const textEdits: TextEdit[] = [
            { range: suggestion.range, newText: suggestion.newText },
            ...suggestion.additionalTextEdits,
          ];
          textEdits.sort((a, b) => a.range.start.offset - b.range.start.offset);
          let result = "";
          let preOffset = 0;
          for (const edit of textEdits) {
            if (edit.range.start.offset > preOffset) {
              result += content.slice(preOffset, edit.range.start.offset);
            }
            result += edit.newText;
            preOffset = edit.range.end.offset;
          }
          const last = result.length;
          if (preOffset < content.length) {
            result += content.slice(preOffset);
          }
          updateContent(result);
          requestAnimationFrame(() => {
            if (textareaRef.current) {
              textareaRef.current.focus();
              textareaRef.current.selectionStart =
                textareaRef.current.selectionEnd = last;
            }
          });
        }
      }
    };
  };

  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter") {
      if (
        choosedSuggestion >= 0 &&
        choosedSuggestion < compileInfo.suggestions.length
      ) {
        e.preventDefault();
        handleSuggestion(compileInfo.suggestions[choosedSuggestion])();
        return;
      }
      const textarea = textareaRef.current;
      if (textarea) {
        const { selectionStart: start, selectionEnd: end } = textarea;
        if (start === end && content) {
          if (content.at(start - 1) === "{" && content.at(start) === "}") {
            e.preventDefault();
            updateContent(
              content.substring(0, start) + "\n\n" + content.substring(end)
            );
            // 更新光标位置
            requestAnimationFrame(() => {
              if (textareaRef.current) {
                textareaRef.current.selectionStart =
                  textareaRef.current.selectionEnd = start + 1;
              }
            });
          }
        }
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (compileInfo.suggestions.length > 0) {
        if (choosedSuggestion < 0) {
          setChoosedSuggestion(0);
        } else if (choosedSuggestion >= compileInfo.suggestions.length) {
          setChoosedSuggestion(0);
        } else {
          setChoosedSuggestion(
            (choosedSuggestion + 1) % compileInfo.suggestions.length
          );
        }
        return;
      }

      const textarea = textareaRef.current;
      if (textarea) {
        const { selectionStart: start, selectionEnd: end } = textarea;
        const insertSpaces = "  ";
        if (content) {
          // insert space
          updateContent(
            content.substring(0, start) + insertSpaces + content.substring(end)
          );
          // 更新光标位置
          requestAnimationFrame(() => {
            if (textareaRef.current) {
              textareaRef.current.selectionStart =
                textareaRef.current.selectionEnd = start + insertSpaces.length;
            }
          });
        } else {
          updateContent("  ");
        }
      }
    } else if (["(", "{", "["].includes(e.key)) {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (textarea) {
        const { selectionStart: start, selectionEnd: end } = textarea;
        const closeBracket = e.key === "(" ? ")" : e.key === "{" ? "}" : "]";
        if (content) {
          updateContent(
            content.substring(0, start) +
              e.key +
              closeBracket +
              content.substring(end)
          );
          requestAnimationFrame(() => {
            if (textareaRef.current) {
              textareaRef.current.selectionStart =
                textareaRef.current.selectionEnd = start + 1;
            }
          });
        } else {
          updateContent(e.key + closeBracket);
          requestAnimationFrame(() => {
            if (textareaRef.current) {
              textareaRef.current.selectionStart =
                textareaRef.current.selectionEnd = 1;
            }
          });
        }
      }
    } else if ([")", "}", "]"].includes(e.key)) {
      const textarea = textareaRef.current;
      if (textarea) {
        const { selectionStart: start, selectionEnd: end } = textarea;
        if (start === end && content && content[start] === e.key) {
          e.preventDefault();
          requestAnimationFrame(() => {
            if (textareaRef.current) {
              textareaRef.current.selectionStart =
                textareaRef.current.selectionEnd = start + 1;
            }
          });
        }
      }
    } else if (e.key === "Backspace") {
      const textarea = textareaRef.current;
      if (textarea) {
        const { selectionStart: start, selectionEnd: end } = textarea;
        if (
          content &&
          start === end &&
          ((content[start - 1] === "(" && content[start] === ")") ||
            (content[start - 1] === "{" && content[start] === "}") ||
            (content[start - 1] === "[" && content[start] === "]"))
        ) {
          e.preventDefault();
          updateContent(
            content.substring(0, start - 1) + content.substring(start + 1)
          );
          requestAnimationFrame(() => {
            if (textareaRef.current) {
              textareaRef.current.selectionStart =
                textareaRef.current.selectionEnd = start - 1;
            }
          });
        }
      }
    } else if (e.key === "Escape") {
      if (renameSource.length > 0) {
        e.preventDefault();
        setRenameSource("");
      }
      if (
        choosedSuggestion >= 0 &&
        choosedSuggestion < compileInfo.suggestions.length
      ) {
        e.preventDefault();
        setChoosedSuggestion(-1);
      }
    } else if (e.key === "F2") {
      const textarea = textareaRef.current;
      if (textarea) {
        const { selectionStart: start, selectionEnd: end } = textarea;
        for (const token of compileInfo.tokens) {
          if (
            token.content.trim().length > 0 &&
            token.range.start.offset <= start &&
            token.range.end.offset >= start
          ) {
            e.preventDefault();
            setRenameSource(token.content);
            return;
          }
        }
      }
    }
  };

  return (
    <div className={cn("flex flex-col w-full m-1", className)}>
      <div className="relative">
        <textarea
          className="absolute top-0 left-0 w-full h-full font-mono z-[2] overflow-y-hidden p-2 ring-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none rounded-sm bg-transparent text-transparent caret-black dark:caret-white text-nowrap"
          onChange={handleChange}
          onBlur={handleContentBlur}
          onSelect={handleSelect}
          onKeyDown={handleKeyDown}
          value={content || ""}
          ref={textareaRef}
        />
        <pre
          ref={highlightRef}
          className="bg-gray-200 dark:bg-gray-800 relativity w-full h-full font-mono z-[0] overflow-y-hidden p-2 pointer-events-none"
        >
          <code aria-placeholder={placeholder}>
            {compileInfo.tokens.length > 0
              ? compileInfo.tokens.map((token, index) => {
                  return (
                    <TokenWrapper
                      key={index}
                      token={token}
                      textareaRow={textareaRow}
                      textareaCol={textareaCol}
                    />
                  );
                })
              : modifiedCode(content || "")}
          </code>
        </pre>
      </div>
      {renameSource.length > 0 && (
        <div className="flex items-center space-x-2 m-2">
          <div className="font-bold">重命名</div>
          <Input
            className="py-0 px-2 m-0 h-6 w-auto"
            autoFocus
            defaultValue={renameSource}
            onSubmit={handleRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleRename(e);
              } else if (e.key === "Esc") {
                e.preventDefault();
                setRenameSource("");
              }
            }}
            onBlur={() => {
              setRenameSource("");
            }}
          />
        </div>
      )}
      <SuggestionBlock
        textareaCol={textareaCol}
        textareaRow={textareaRow}
        suggestions={compileInfo.suggestions}
        handleSuggestions={handleSuggestion}
        choosedSuggestion={choosedSuggestion}
      />
      <ProofStateBlock
        cNodes={compileInfo.cNodes}
        textareaCol={textareaCol}
        textareaRow={textareaRow}
      />
      <ErrorBlock errors={compileInfo.errors} />
    </div>
  );
}
