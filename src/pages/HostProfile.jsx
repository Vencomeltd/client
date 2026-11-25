// client/src/pages/HostProfile.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { data, redirect, useLoaderData } from "react-router";
import { apiFetch } from "../utils/api";
import VencomeLoader from "../components/Loader";
import VerifiedName from "../components/VerifiedName";
import PropertyCard from "../components/PropertyCard";
import { hostPublicName } from "../utils/hostName";
import { edgeCached } from "../utils/edgeCache";

// The server renders the profile, so search engines see each host's own page:
// 404 for a host that doesn't exist, 503 (retry later) if the API fails --
// never an empty page with a 200. The component then fetches client-side, so
// visitors still get the profile.
export async function loader({ params, request }) {
  const api = import.meta.env.VITE_API_URL;
  const unavailable = () => data({ host: null, listings: [] }, { status: 503, headers: { "Retry-After": "120" } });
  try {
    const hostRes = await fetch(`${api}/hosts/${params.id}`);
    if (hostRes.status === 404) return data({ host: null, listings: [], notFound: true }, { status: 404 });
    if (!hostRes.ok) return unavailable();
    const host = await hostRes.json();
    // Old id links go to the one slug URL.
    if (host.slug && params.id.toLowerCase() !== host.slug.toLowerCase()) {
      return redirect(`/host/${host.slug}${new URL(request.url).search}`, 301);
    }
    const listingRes = await fetch(`${api}/properties?host=${host._id}&limit=50`);
    if (!listingRes.ok) return unavailable();
    const body = await listingRes.json();
    return edgeCached({ host, listings: body.properties || [] });
  } catch {
    return unavailable();
  }
}

export function headers({ loaderHeaders }) {
  return loaderHeaders;
}

export function meta({ data: loaded, params }) {
  const host = loaded?.host;
  if (!host) return [{ title: loaded?.notFound ? "Host not found | VenCome" : "VenCome" }, { name: "robots", content: "noindex" }];

  const name = hostPublicName(host);
  // "Host" is the fallback for an account with no public name yet.
  const title = name === "Host" ? "Host profile | VenCome" : `${name} | Host on VenCome`;
  const description = host.bio?.trim().slice(0, 155) || `See the commercial spaces ${name === "Host" ? "this host" : name} lists on VenCome.`;
  const url = `https://www.vencome.com/host/${host.slug || params.id}`;
  return [
    { title },
    { name: "description", content: description },
    // A profile with nothing listed has nothing to show in search.
    { name: "robots", content: loaded.listings.length ? "index, follow" : "noindex, follow" },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
  ];
}

const HostProfile = () => {
  const { id } = useParams();
  const loaded = useLoaderData();
  // Only used when the server couldn't load the profile.
  const [fetched, setFetched] = useState(null);
  const [failedId, setFailedId] = useState(null);
  const needsFetch = !loaded.host && !loaded.notFound;

  useEffect(() => {
    if (!needsFetch) return;
    let cancelled = false;

    const fetchHost = async () => {
      setFailedId(null);
      try {
        // Sequential, not Promise.all -- the :id URL param can now be a slug
        // (e.g. /host/jayden-benson), and the listings query needs the
        // host's real _id, which only the /hosts/:id response resolves.
        const hostData = await apiFetch({ endpoint: `/hosts/${id}` });
        if (cancelled) return;

        // Filtered server-side -- fetching the general /properties list and
        // matching client-side only ever showed a host's listings that
        // happened to land on page 1 of the newest-20 platform-wide.
        const listingData = await apiFetch({
          endpoint: `/properties?host=${hostData._id}&limit=50`,
        });
        if (cancelled) return;
        setFetched({ id, host: hostData, listings: listingData.properties || [] });
      } catch {
        if (!cancelled) setFailedId(id);
      }
    };

    fetchHost();
    return () => {
      cancelled = true;
    };
  }, [id, needsFetch]);

  const profile = loaded.host ? loaded : fetched?.id === id ? fetched : null;
  const host = profile?.host;
  const listings = profile?.listings || [];

  if (needsFetch && !host && failedId !== id) return <VencomeLoader />;

  if (!host) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4 pt-16">
        <div className="text-center">
          <p className="text-gray-700 font-medium mb-2">Host not found</p>
          <Link to="/" className="text-primary underline">
            Back to homepage
          </Link>
        </div>
      </div>
    );
  }

  const hostName = hostPublicName(host);

  return (
    <div className="min-h-screen bg-white px-4 pb-6 pt-24 sm:px-8 sm:pb-8 sm:pt-28">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center text-center gap-3 sm:flex-row sm:items-center sm:text-left sm:gap-5 mb-5">
          <img
            src={host.profileImage || "https://via.placeholder.com/96"}
            alt={hostName}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover flex-shrink-0"
          />
          <VerifiedName
            name={hostName}
            isVerified={host.businessVerified}
            className="text-lg sm:text-xl"
          />
        </div>

        {host.bio && (
          <p className="text-gray-700 mb-6 text-center sm:text-left leading-relaxed max-w-2xl mx-auto sm:mx-0">
            {host.bio}
          </p>
        )}

        <div className="flex justify-center sm:justify-start gap-8 sm:gap-10 text-sm border-t border-b border-gray-200 py-4 mb-8">
          <div className="text-center sm:text-left">
            <p className="font-semibold">{host.totalListings}</p>
            <p className="text-gray-500">Listings</p>
          </div>
          <div className="text-center sm:text-left">
            {host.avgRating ? (
              <>
                <p className="font-semibold">{host.avgRating} stars</p>
                <p className="text-gray-500">{host.totalReviews} reviews</p>
              </>
            ) : (
              <>
                <p className="font-semibold">—</p>
                <p className="text-gray-500">No reviews yet</p>
              </>
            )}
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold mb-4">Their Listings</h2>
        {listings.length === 0 ? (
          <p className="text-gray-500">This host hasn't published any listings yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HostProfile;
