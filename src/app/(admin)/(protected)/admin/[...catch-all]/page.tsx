import AdminNotFound from "../not-found";

export default function AdminCatchAll() {
  //   redirect("/admin");
  // 또는
  AdminNotFound(); // 이 경우 app/(admin)/admin/not-found.tsx가 실행됩니다.
}
