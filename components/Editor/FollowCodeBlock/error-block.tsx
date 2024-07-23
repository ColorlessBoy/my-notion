import { Error, getFollowErrorMsg } from "@/lib/follow-parser";
import { cn } from "@/lib/utils";

type ErrorBlockProps = {
  errors: Error[];
  className?: string;
};
export function ErrorBlock({ errors, className }: ErrorBlockProps) {
  return (
    errors.length > 0 && (
      <div className={cn("flex flex-col w-full h-full", className)}>
        <h1 className="font-bold">报错信息：</h1>
        <ul>
          {errors.map((error, idx) => {
            return (
              <li key={idx} className="text-red-600">
                {error.token.content}({error.token.range.start.line}:
                {error.token.range.start.character}-{error.token.range.end.line}
                :{error.token.range.end.character}) :{" "}
                {getFollowErrorMsg(error.type)}
              </li>
            );
          })}
        </ul>
      </div>
    )
  );
}
