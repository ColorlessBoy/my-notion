type TokenTooltipProps = {
  message: string;
};

export const TokenTooltip = ({ message }: TokenTooltipProps) => (
  <div className="z-[2] top-full left-0 mt-1 absolute bg-red-100 text-red-700 rounded border-solid border-2 border-gray-800">
    {message}
  </div>
);
