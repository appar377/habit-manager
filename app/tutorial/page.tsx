import TutorialChecklist from "@/components/TutorialChecklist";

export default function TutorialPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-lg font-bold text-foreground">チュートリアル</h1>
        <p className="text-sm text-fg-muted mt-0.5">チェックリストを順番に進めましょう</p>
      </header>

      <TutorialChecklist />
    </div>
  );
}
