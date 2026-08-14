// client/src/pages/HostProfile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../utils/api";
import VencomeLoader from "../components/Loader";
import VerifiedName from "../components/VerifiedName";
import { getLowestWeeklyRate } from "../utils/dayPricing";

const HostProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [host, setHost] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHost = async () => {
      const [hostData, listingData] = await Promise.all([
        apiFetch({ endpoint: `/hosts/${id}` }),
        apiFetch({ endpoint: `/properties` }),
      ]);
      setHost(hostData);
      setListings(listingData.properties);
      setLoading(false);
    };
    fetchHost();
  }, [id]);

  // const joinDate = new Date(host.createdAt).toLocaleDateString("en-US", {
  //   year: "numeric",
  //   month: "long",
  // });

  const hostProperties = listings.filter((p) => p.host._id === host._id);

  if (loading) return <VencomeLoader />;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {host && (
          <>
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={host.profileImage || "https://via.placeholder.com/80"}
                alt={host.displayName}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <VerifiedName name={host.displayName} />
              </div>
            </div>
            {host.bio && <p className="text-gray-700 mb-4">{host.bio}</p>}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold">{host.totalListings}</p>
                <p className="text-gray-500">Listings</p>
              </div>
              <div>
                {host.avgRating ? (
                  <>
                    <p className="font-semibold flex items-center">
                      {host.avgRating} stars
                    </p>
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
          </>
        )}
        <h2 className="text-2xl font-bold mt-8 mb-4">Their Listings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hostProperties.map((prop) => (
            <div
              key={prop._id}
              className="bg-white p-4 rounded-lg shadow cursor-pointer"
              onClick={() => navigate(`/property/${prop.slug || prop._id}`)}
            >
              <img
                src={prop.coverImage}
                alt=""
                className="w-full h-40 object-cover rounded"
              />
              <h3 className="font-semibold mt-2">{prop.title}</h3>
              <p className="text-primary">
                {(prop.pricing?.customDayPricing?.length || 0) > 0 ? "From " : ""}$
                {getLowestWeeklyRate(prop.pricing.weekdayPrice, prop.pricing?.customDayPricing)}/day
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HostProfile;
