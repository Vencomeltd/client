import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Building2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function CategoryComingSoon() {
  const { categoryName } = useParams();
  const displayName = decodeURIComponent(categoryName || "This category");

  return (
    <>
      <Navbar />
      <main
        className="flex min-h-[70vh] items-center justify-center px-4 py-20"
        style={{ backgroundColor: "#F8F6F0" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto flex max-w-lg flex-col items-center text-center"
        >
          <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#F4F7FF] text-[#305CDE]">
            <Sparkles size={28} />
          </span>

          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#305CDE]">
            Coming Soon
          </p>

          <h1 className="mb-4 text-[clamp(24px,5vw,36px)] font-extrabold text-[#0A1628]">
            {displayName} is launching soon
          </h1>

          <p className="mb-10 text-[15px] leading-7 text-[#6B7280]">
            We're onboarding hosts in this category right now. Browsing and
            booking will open shortly — but you can list your space today
            and be ready the moment it goes live.
          </p>

          <Link
            to="/create-space"
            className="inline-flex items-center gap-2 rounded-full bg-[#305CDE] px-8 py-4 text-[15px] font-semibold text-white shadow-[0_8px_24px_rgba(48,92,222,0.35)] transition hover:bg-[#254FC7]"
          >
            <Building2 size={18} />
            Start Listing Your Space
          </Link>

          <Link
            to="/"
            className="mt-6 text-sm font-medium text-[#6B7280] underline-offset-4 hover:text-[#305CDE] hover:underline"
          >
            Back to homepage
          </Link>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
