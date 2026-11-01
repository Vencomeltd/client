import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";

// Homepage: for visitors who didn't find the right space -- talk to the team
// in the chat (bottom corner) or through the contact page.
export default function GetInTouchBlock() {
  return (
    <section className="bg-white py-10 md:py-14">
      <div className="mx-auto max-w-[1440px] px-4 md:px-6">
        <div className="flex flex-col gap-6 rounded-2xl border border-[#E0E7FF] bg-[#F5F7FF] p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-[clamp(22px,4vw,30px)] font-extrabold leading-tight text-[#0A1628]">
              Couldn't find what you're looking for?
            </h2>
            <p className="mt-2 max-w-xl text-[15px] leading-6 text-[#4B5563]">
              Tell us the space you need — area, size, dates and budget — and our team will find options for you.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("vencome:open-chat"))}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-[10px] bg-[#305CDE] px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-[#254FC7]"
            >
              <MessageSquare size={16} /> Chat with us
            </button>
            <Link
              to="/contact"
              className="inline-flex min-h-[44px] items-center rounded-[10px] border border-[#E5E7EB] bg-white px-6 py-3 text-[15px] font-semibold text-[#0A1628] transition hover:border-[#0A1628]"
            >
              Get in touch
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
