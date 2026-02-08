import { redirect } from "next/navigation";

/** 記録タブは廃止。予定でチェック＝記録と同義のため、予定へリダイレクト。 */
export default function CapturePage() {
  redirect("/plan");
}
