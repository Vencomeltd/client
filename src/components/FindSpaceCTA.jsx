import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// "Find your space" call to action at the end of a page (blog articles).
// Light card in the site's own colours -- replaces the old solid navy box.
export default function FindSpaceCTA() {
  return (
    <section className="mt-12 rounded-2xl border border-[#E0E7FF] bg-[#F5F7FF]">
      <div className="flex flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.28em] text-[#305CDE]">Find your space</p>
          <h3 className="text-[22px] font-extrabold leading-tight text-[#0A1628]">Find your perfect commercial space</h3>
          <p className="mt-2 max-w-md text-[15px] leading-6 text-[#4B5563]">
            Browse offices, studios, meeting rooms and more across the UK.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/search"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-[10px] bg-[#305CDE] px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-[#254FC7]"
          >
            Browse spaces <ArrowRight size={16} />
          </Link>
          <Link
            to="/create-space"
            className="inline-flex min-h-[44px] items-center rounded-[10px] border border-[#E5E7EB] bg-white px-6 py-3 text-[15px] font-semibold text-[#0A1628] transition hover:border-[#0A1628]"
          >
            List your space
          </Link>
        </div>
      </div>
    </section>
  );
}
