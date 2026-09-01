// client/src/pages/HostProfile.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { apiFetch } from "../utils/api";
import VencomeLoader from "../components/Loader";
import VerifiedName from "../components/VerifiedName";
import PropertyCard from "../components/PropertyCard";

const HostProfile = () => {
  const { id } = useParams();
  const [host, setHost] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchHost = async () => {
      setLoading(true);
      setError(false);
      try {
        // Sequential, not Promise.all -- the :id URL param can now be a slug
        // (e.g. /host/jayden-benson), and the listings query needs the
        // host's real _id, which only the /hosts/:id response resolves.
        const hostData = await apiFetch({ endpoint: `/hosts/${id}` });
        if (cancelled) return;
        setHost(hostData);

        // Filtered server-side -- fetching the general /properties list and
        // matching client-side only ever showed a host's listings that
        // happened to land on page 1 of the newest-20 platform-wide.
        const listingData = await apiFetch({
          endpoint: `/properties?host=${hostData._id}&limit=50`,
        });
        if (cancelled) return;
        setListings(listingData.properties || []);
      } catch (err) {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchHost();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <VencomeLoader />;

  if (error || !host) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 pt-16">
        <div className="text-center">
          <p className="text-gray-700 font-medium mb-2">Host not found</p>
          <Link to="/" className="text-primary underline">
            Back to homepage
          </Link>
        </div>
      </div>
    );
  }

  const hostName =
    host.displayName ||
    `${host.firstName || ""} ${host.lastName || ""}`.trim() ||
    "Host";

  return (
    <div className="min-h-screen bg-gray-50 px-4 pb-6 pt-24 sm:px-8 sm:pb-8 sm:pt-28">
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
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
