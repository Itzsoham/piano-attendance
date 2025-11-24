import { ReactNode } from "react";
import { Music2 } from "lucide-react"; // softer, musical icon
import { Separator } from "@/components/ui/separator";
import { APP_CONFIG } from "@/config/app-config";

export default function Layout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <main>
      <div className="grid h-dvh justify-center p-2 lg:grid-cols-2">
        {/* LEFT SIDE — Piano themed intro */}
        <div className="bg-primary relative order-2 hidden h-full rounded-3xl lg:flex">
          <div className="text-primary-foreground absolute top-10 space-y-1 px-10">
            <Music2 className="size-10" />
            <h1 className="text-2xl font-medium">{APP_CONFIG.name}</h1>
            <p className="text-sm">Where every lesson becomes a melody.</p>
          </div>

          <div className="absolute bottom-10 flex w-full justify-between px-10">
            <div className="text-primary-foreground flex-1 space-y-1">
              <h2 className="font-medium">Track with ease.</h2>
              <p className="text-sm">
                Manage lessons, attendance, and monthly earnings — all in one calm, elegant workspace.
              </p>
            </div>

            <Separator orientation="vertical" className="mx-3 h-auto!" />

            <div className="text-primary-foreground flex-1 space-y-1">
              <h2 className="font-medium">Stay organized.</h2>
              <p className="text-sm">
                Keep student records, lesson history, and reports beautifully structured and always within reach.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE — Auth forms / children */}
        <div className="relative order-1 flex h-full">{children}</div>
      </div>
    </main>
  );
}
