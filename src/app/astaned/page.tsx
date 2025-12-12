import { redirect } from "next/navigation";

export default function AstanedPage() {
  // Cel: statyczna strona HTML w /public/astaned.
  // Dzięki temu działa lokalnie pod /astaned (jako przyjazny adres).
  redirect("/astaned/index.html");
}
