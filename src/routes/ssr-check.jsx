export function meta() {
  return [{ title: "SSR check | VenCome" }];
}

export default function SsrCheck() {
  return <div id="ssr-check">SSR toolchain is working. Rendered at {new Date().toISOString()}.</div>;
}
