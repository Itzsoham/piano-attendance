import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IconBrandGoogleOne } from "@tabler/icons-react";

export function GoogleButton({ className, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button variant="secondary" className={cn(className)} {...props}>
      <IconBrandGoogleOne className="size-4" />
      Continue with Google
    </Button>
  );
}
