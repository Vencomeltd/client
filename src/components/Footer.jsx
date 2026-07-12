import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-wrap justify-between items-start">
        {/* Company Brand */}
        <div className="mb-6">
          <img src="/logo-blue.png" className="w-[10rem]" />
          <p className="text-gray-500 text-sm max-w-xs my-3">
            Discover the worlds most exceptional commercial spaces, from offices
            and studios to venues and landmark locations.
          </p>

          {/* Social Links (keep <a> for external links) */}
          <div className="flex space-x-3 text-gray-500">
            <a
              href="https://www.instagram.com/Vencomeltd"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="VenCome on Instagram"
              className="hover:text-[#0A1628] transition"
            >
              <Instagram size={20} />
            </a>
            <a
              href="https://www.facebook.com/Vencome"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="VenCome on Facebook"
              className="hover:text-[#0A1628] transition"
            >
              <Facebook size={20} />
            </a>
            <a
              href="https://www.linkedin.com/company/vencome/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="VenCome on LinkedIn"
              className="hover:text-[#0A1628] transition"
            >
              <Linkedin size={20} />
            </a>
          </div>
        </div>

        {/* Footer Links */}
        <div className="flex flex-wrap gap-12">
          <div className="pr-20">
            <div className="font-semibold mb-2">Company</div>
            <ul className="text-gray-500 text-sm space-y-1">
              <li>
                <Link to="/about">About</Link>
              </li>
              <li>
                <Link to="/careers">Careers</Link>
              </li>
              <li>
                <Link to="/press">Press</Link>
              </li>
              <li>
                <Link to="/blogs">Blog</Link>
              </li>
              <li>
                <Link to="/partners">Partners</Link>
              </li>
            </ul>
          </div>

          <div className="pr-20">
            <div className="font-semibold mb-2">Support</div>
            <ul className="text-gray-500 text-sm space-y-1">
              <li>
                <Link to="/help-center">Help Center</Link>
              </li>
              <li>
                <Link to="/safety">Safety Information</Link>
              </li>
              <li>
                <Link to="/cancellation-options">Cancellation Options</Link>
              </li>
              <li>
                <Link to="/contact">Contact Us</Link>
              </li>
              <li>
                <Link to="/accessibility">Accessibility</Link>
              </li>
            </ul>
          </div>

          <div className="pr-20">
            <div className="font-semibold mb-2">Resources</div>
            <ul className="text-gray-500 text-sm space-y-1">
              <li>
                <Link to="/faq">FAQs</Link>
              </li>
              <li>
                <Link to="/privacy">Privacy</Link>
              </li>
              <li>
                <Link to="/terms-and-conditions">Terms</Link>
              </li>
              <li>
                <Link to="/sitemap">Sitemap</Link>
              </li>
              <li>
                <Link to="/blogs">Blog</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center border-t border-gray-200 mt-8 pt-6 text-gray-400 text-sm">
        <span>© 2025 VenCome. All rights reserved.</span>

        <div className="space-x-6">
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms-and-conditions">Terms</Link>
          <Link to="/sitemap">Sitemap</Link>
        </div>
      </div>
    </footer>
  );
}
