import ProfileSettings from "@/components/ProfileSettings";
import CommunitySettings from "@/components/CommunitySettings";
import CommunityFriendTabs from "@/components/CommunityFriendTabs";
import TutorialTrigger from "@/components/TutorialTrigger";
import GoogleCalendarSettings from "@/components/GoogleCalendarSettings";
import LogoutButton from "@/components/LogoutButton";

export default async function SettingsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-lg font-bold text-foreground">設定</h1>
        <p className="text-sm text-fg-muted mt-0.5">プロフィール・フレンド・チュートリアル</p>
      </header>

      <LogoutButton />

      <ProfileSettings />

      <GoogleCalendarSettings />

      <CommunitySettings />

      <section className="rounded-[var(--radius-xl)] border-2 border-border bg-bg-muted p-4 shadow-[var(--shadow-card)] space-y-2">
        <h2 className="text-sm font-semibold text-foreground">チュートリアル</h2>
        <p className="text-xs text-fg-muted">いつでもチェックリストを再表示できます。</p>
        <TutorialTrigger label="チュートリアルを開く" className="mt-1" />
      </section>

      <CommunityFriendTabs />
    </div>
  );
}
