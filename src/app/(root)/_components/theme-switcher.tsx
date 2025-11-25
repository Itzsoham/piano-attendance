"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Check, PaletteIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const themes = [
  {
    name: "Default",
    id: "default",
    color: "#000000",
  },
  {
    name: "Red",
    id: "red",
    color: "#ef4444",
  },
  {
    name: "Rose",
    id: "rose",
    color: "#f43f5e",
  },
  {
    name: "Orange",
    id: "orange",
    color: "#f97316",
  },
  {
    name: "Green",
    id: "green",
    color: "#10b981",
  },
  {
    name: "Blue",
    id: "blue",
    color: "#3b82f6",
  },

  {
    name: "Violet",
    id: "violet",
    color: "#8b5cf6",
  },
  {
    name: "Teal",
    id: "teal",
    color: "#14b8a6",
  },
  {
    name: "Bronze",
    id: "bronze",
    color: "#b45309",
  },
];

export function ThemeSwitcher() {
  const [open, setOpen] = React.useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!theme) {
      setTheme("system");
    }
  }, [theme, setTheme]);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon">
        <PaletteIcon className="h-5 w-5" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  // Helper function to get current theme base name and mode
  const getCurrentThemeInfo = () => {
    if (!theme || theme === "system") {
      return { base: "default", mode: "system" };
    }
    if (theme === "light" || theme === "dark") {
      return { base: "default", mode: theme };
    }
    const parts = theme.split("-");
    return { base: parts[0], mode: parts[1] || "light" };
  };

  const { base: currentBase, mode: currentMode } = getCurrentThemeInfo();

  // Helper function to apply theme
  const applyTheme = (baseTheme: string, mode: string) => {
    if (baseTheme === "default") {
      setTheme(mode);
    } else {
      setTheme(`${baseTheme}-${mode}`);
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="right">
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon">
          <PaletteIcon className="h-5 w-5" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Themes</DrawerTitle>
          <DrawerDescription>Customize your Workspace by changing the appearance and theme color.</DrawerDescription>
        </DrawerHeader>
        <div className="p-4 pb-0">
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-medium">Appearance</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="lg"
                className={cn(
                  "flex h-24 flex-col items-center justify-center gap-2 border-2",
                  currentMode === "light" && "border-primary",
                )}
                onClick={() => applyTheme(currentBase, "light")}
              >
                <div className="h-12 w-full rounded bg-[#f9fafb] p-2">
                  <div className="h-2 w-2/3 rounded-sm bg-[#d1d5db]"></div>
                </div>
                <span className="text-xs">Light</span>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className={cn(
                  "flex h-24 flex-col items-center justify-center gap-2 border-2",
                  currentMode === "dark" && "border-primary",
                )}
                onClick={() => applyTheme(currentBase, "dark")}
              >
                <div className="h-12 w-full rounded bg-[#1f2937] p-2">
                  <div className="h-2 w-2/3 rounded-sm bg-[#6b7280]"></div>
                </div>
                <span className="text-xs">Dark</span>
              </Button>
            </div>
            <Separator className="my-2" /> <h3 className="text-sm font-medium">Theme Color</h3>
            <div className="grid grid-cols-3 gap-3">
              {themes.map((t) => (
                <button
                  key={t.id}
                  className={cn(
                    "group border-border relative flex h-16 flex-col items-center justify-center gap-1.5 rounded-md border p-1",
                    currentBase === t.id && "ring-ring ring-2 ring-offset-2",
                  )}
                  onClick={() => applyTheme(t.id, currentMode)}
                >
                  <span className="h-6 w-6 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className="text-xs font-medium">{t.name}</span>
                  {currentBase === t.id && (
                    <span className="bg-primary text-primary-foreground absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
