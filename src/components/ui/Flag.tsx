type FlagProps = {
  code: string;
  className?: string;
};

export default function Flag({ code, className }: FlagProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/48x36/${code.toLowerCase()}.png`}
      alt=""
      width={20}
      height={15}
      className={className}
    />
  );
}
