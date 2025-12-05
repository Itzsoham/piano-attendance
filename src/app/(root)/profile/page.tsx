import { getCurrentUser } from "@/lib/actions/profile";
import { ProfileForm } from "./_components/profile-form";
import { PasswordForm } from "./_components/password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Account Overview */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Account Overview</CardTitle>
            <CardDescription>Your account information and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Account ID</p>
                <p className="font-mono text-sm">{user.id}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">Role</p>
                <Badge variant="secondary" className="mt-1">
                  {user.role}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">Member Since</p>
                <p className="text-sm">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <div className="md:col-span-2">
          <ProfileForm initialData={user} />
        </div>

        {/* Password Form */}
        <div className="md:col-span-2">
          <PasswordForm />
        </div>
      </div>
    </div>
  );
}
