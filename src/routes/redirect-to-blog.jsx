import { redirect } from "react-router";

export function loader() {
  return redirect("/blog", 301);
}

export default function RedirectToBlog() {
  return null;
}
