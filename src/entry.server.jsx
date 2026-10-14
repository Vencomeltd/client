// Same server entry the Vercel preset uses by default (HTML rendering is
// unchanged), plus compression for client-navigation data requests.
import { handleRequest, streamTimeout } from "@vercel/react-router/entry.server";

export { streamTimeout };
export default handleRequest;

// Every client-side navigation fetches /<page>.data (Content-Type
// text/x-script). Vercel's edge compresses HTML and JSON but not that type,
// so those responses went out uncompressed -- 525 KB for the homepage, ~80%
// of which gzip removes. Compress them here when the browser accepts gzip.
export function handleDataRequest(response, { request }) {
  const acceptsGzip = /\bgzip\b/.test(request.headers.get("Accept-Encoding") || "");
  if (!acceptsGzip || !response.body || response.headers.has("Content-Encoding")) {
    return response;
  }
  const headers = new Headers(response.headers);
  headers.set("Content-Encoding", "gzip");
  headers.delete("Content-Length");
  headers.append("Vary", "Accept-Encoding");
  return new Response(response.body.pipeThrough(new CompressionStream("gzip")), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
