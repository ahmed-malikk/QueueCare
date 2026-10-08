import { ClipboardList, LogOut, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Staff } from "@/lib/dal";
import { signOut } from "./login/actions";

const ROLES = {
  receptionist: { name: "Reception", icon: ClipboardList },
  doctor: { name: "Doctor", icon: Stethoscope },
  patient: { name: "Patient", icon: ClipboardList },
} as const;

/** The strip at the top of every staff screen: who is signed in, and a sign-out button. */
export function StaffBar({ user }: { user: Staff }) {
  const { name, icon: Icon } = ROLES[user.role];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b py-3">
      <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="secondary" className="h-6 px-2.5">
          <Icon /> {name}
        </Badge>
        <span className="truncate">{user.email}</span>
      </div>
      <form action={signOut}>
        <Button type="submit" variant="outline" size="sm">
          <LogOut /> Sign out
        </Button>
      </form>
    </div>
  );
}
