import type { JSX } from "react";
import { cn } from "../lib/utils";

type TypographyProps<T extends keyof JSX.IntrinsicElements> = Omit<
  React.ComponentPropsWithoutRef<T>,
  "className"
> & { className?: string };

function H1({ className, ...props }: TypographyProps<"h1">) {
  return (
    <h1
      className={cn(
        "scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance",
        className,
      )}
      {...props}
    />
  );
}

function H2({ className, ...props }: TypographyProps<"h2">) {
  return (
    <h2
      className={cn(
        "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
        className,
      )}
      {...props}
    />
  );
}
function H3({ className, ...props }: TypographyProps<"h3">) {
  return (
    <h3
      className={cn(
        "scroll-m-20 text-2xl font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  );
}
function H4({ className, ...props }: TypographyProps<"h4">) {
  return (
    <h4
      className={cn(
        "scroll-m-20 text-xl font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  );
}
function P({ className, ...props }: TypographyProps<"p">) {
  return (
    <p
      className={cn("leading-7 [&:not(:first-child)]:mt-6", className)}
      {...props}
    />
  );
}
function Blockquote({ className, ...props }: TypographyProps<"blockquote">) {
  return (
    <blockquote
      className={cn("mt-6 border-l-2 pl-6 italic", className)}
      {...props}
    />
  );
}
// function Table() {
//   return (
//     <div className="my-6 w-full overflow-y-auto">
//       <table className="w-full">
//         <thead>
//           <tr className="even:bg-muted m-0 border-t p-0">
//             <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
//               King's Treasury
//             </th>
//             <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
//               People's happiness
//             </th>
//           </tr>
//         </thead>
//         <tbody>
//           <tr className="even:bg-muted m-0 border-t p-0">
//             <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
//               Empty
//             </td>
//             <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
//               Overflowing
//             </td>
//           </tr>
//           <tr className="even:bg-muted m-0 border-t p-0">
//             <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
//               Modest
//             </td>
//             <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
//               Satisfied
//             </td>
//           </tr>
//           <tr className="even:bg-muted m-0 border-t p-0">
//             <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
//               Full
//             </td>
//             <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
//               Ecstatic
//             </td>
//           </tr>
//         </tbody>
//       </table>
//     </div>
//   );
// }
// function List() {
//   return (
//     <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
//       <li>1st level of puns: 5 gold coins</li>
//       <li>2nd level of jokes: 10 gold coins</li>
//       <li>3rd level of one-liners : 20 gold coins</li>
//     </ul>
//   );
// }
function InlineCode({ className, ...props }: TypographyProps<"code">) {
  return (
    <code
      className={cn(
        "bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
        className,
      )}
      {...props}
    />
  );
}
function Lead({ className, ...props }: TypographyProps<"p">) {
  return (
    <p className={cn("text-muted-foreground text-xl", className)} {...props} />
  );
}
function Large({ className, ...props }: TypographyProps<"div">) {
  return <div className={cn("text-lg font-semibold", className)} {...props} />;
}
function Small({ className, ...props }: TypographyProps<"small">) {
  return (
    <small
      className={cn("text-sm leading-none font-medium", className)}
      {...props}
    />
  );
}
function Muted({ className, ...props }: TypographyProps<"p">) {
  return (
    <p className={cn("text-muted-foreground text-sm", className)} {...props} />
  );
}

export const Typography = {
  H1,
  H2,
  H3,
  H4,
  P,
  Blockquote,
  InlineCode,
  Lead,
  Large,
  Small,
  Muted,
};
