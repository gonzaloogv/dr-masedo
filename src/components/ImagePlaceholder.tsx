import { ImageOff } from "lucide-react";

interface Props {
  label?: string;
  className?: string;
  variant?: "light" | "dark";
  ratio?: string; // e.g. "aspect-[4/5]"
  rounded?: boolean;
}

export function ImagePlaceholder({
  label = "Espacio reservado para imagen",
  className = "",
  variant = "light",
  ratio,
  rounded = false,
}: Props) {
  const base = variant === "dark" ? "img-placeholder-dark" : "img-placeholder";
  return (
    <div
      className={[
        base,
        ratio ?? "h-full w-full",
        rounded ? "rounded-md overflow-hidden" : "",
        className,
      ].join(" ")}
    >
      <div className="flex flex-col items-center gap-2 px-6 text-center">
        <ImageOff size={28} strokeWidth={1.4} />
        <span className="text-[10px] tracking-[0.25em] uppercase font-sans opacity-70">
          {label}
        </span>
      </div>
    </div>
  );
}
