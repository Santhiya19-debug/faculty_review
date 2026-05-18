import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MainLayout from "@/components/layout/MainLayout";
import ProfileClient from "./ProfileClient";

export const metadata = { title: "My Profile — Faculty Review" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: myReviews } = await supabase
    .from("reviews")
    .select("*, faculties(name, id, departments(name, icon))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: myRequests } = await supabase
    .from("faculty_requests")
    .select("*, departments(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <MainLayout>
      <ProfileClient
        profile={profile}
        myReviews={myReviews || []}
        myRequests={myRequests || []}
        email={user.email || ""}
      />
    </MainLayout>
  );
}
