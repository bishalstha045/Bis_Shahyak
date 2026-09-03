import React from 'react';
import { Linkedin, Twitter, Instagram, Github, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer({ onNavigate, onOpenHelp, isAuthPage = false }) {
  const handleQuickLink = (targetTab) => {
    if (onNavigate) {
      onNavigate(targetTab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSupportLink = (action) => {
    if (action === 'help' && onOpenHelp) {
      onOpenHelp();
    } else if (action === 'contact') {
      window.location.href = 'mailto:bishayak.help@gmail.com';
    }
  };

  const footerInnerContent = (
    <>
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-xs">

        {/* LEFT: BIS SAHAYAK & Description */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-orange-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              BS
            </div>
            <span className="text-sm font-black text-white tracking-wide">
              BIS <span className="text-orange-400">SAHAYAK</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed font-normal max-w-xs">
            AI-powered compliance platform built to streamline Indian standards search and decision-making for MSMEs.
          </p>
          <div className="flex items-center gap-2 pt-1 text-slate-400">
            <a
              href="https://www.linkedin.com/in/bishalstha045"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="LinkedIn"
              aria-label="LinkedIn"
            >
              <Linkedin size={13} />
            </a>
            <a
              href="https://x.com/bishalstha045"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Twitter / X"
              aria-label="Twitter"
            >
              <Twitter size={13} />
            </a>
            <a
              href="https://instagram.com/bishalstha045"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Instagram"
              aria-label="Instagram"
            >
              <Instagram size={13} />
            </a>
            <a
              href="https://github.com/bishalstha045"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="GitHub"
              aria-label="GitHub"
            >
              <Github size={13} />
            </a>
          </div>
        </div>

        {/* MIDDLE: QUICK LINKS */}
        <div className="space-y-2.5">
          <h4 className="text-[11px] font-bold text-white uppercase tracking-wider text-slate-100">
            Quick Links
          </h4>
          <ul className="space-y-1.5 text-[11px] text-slate-300">
            <li>
              <button
                type="button"
                onClick={() => handleQuickLink('standards')}
                className="hover:text-orange-400 transition-colors text-left"
              >
                Standards
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => handleQuickLink('compliance')}
                className="hover:text-orange-400 transition-colors text-left"
              >
                Compliance
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => handleQuickLink('verification')}
                className="hover:text-orange-400 transition-colors text-left"
              >
                Verify ISI
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => handleQuickLink('documents')}
                className="hover:text-orange-400 transition-colors text-left"
              >
                Documents
              </button>
            </li>
          </ul>
        </div>

        {/* NEXT: SUPPORT */}
        <div className="space-y-2.5">
          <h4 className="text-[11px] font-bold text-white uppercase tracking-wider text-slate-100">
            Support
          </h4>
          <ul className="space-y-1.5 text-[11px] text-slate-300">
            <li>
              <button
                type="button"
                onClick={() => handleSupportLink('help')}
                className="hover:text-orange-400 transition-colors text-left"
              >
                Help Center
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => handleSupportLink('contact')}
                className="hover:text-orange-400 transition-colors text-left"
              >
                Contact
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => handleSupportLink('help')}
                className="hover:text-orange-400 transition-colors text-left"
              >
                Feedback
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => handleQuickLink('home')}
                className="hover:text-orange-400 transition-colors text-left"
              >
                Sitemap
              </button>
            </li>
          </ul>
        </div>

        {/* RIGHT: CONTACT US */}
        <div className="space-y-2.5">
          <h4 className="text-[11px] font-bold text-white uppercase tracking-wider text-slate-100">
            Contact Us
          </h4>
          <div className="text-[11px] text-slate-300 space-y-1.5 leading-relaxed">
            <p className="font-semibold text-white">BIS Sahayak Innovation Hub</p>
            <p className="flex items-start gap-1.5 text-slate-300">
              <MapPin size={13} className="text-orange-400 shrink-0 mt-0.5" />
              <span>Koramangala 4th Block, Bengaluru - 560034</span>
            </p>
            <p className="flex items-center gap-1.5 text-slate-300">
              <Phone size={13} className="text-orange-400 shrink-0" />
              <span>+91 80 2553 1234</span>
            </p>
            <p className="flex items-center gap-1.5">
              <Mail size={13} className="text-orange-400 shrink-0" />
              <a
                href="mailto:bishayak.help@gmail.com"
                className="text-orange-300 hover:text-orange-200 hover:underline"
              >
                bishayak.help@gmail.com
              </a>
            </p>
          </div>
        </div>

      </div>

      {/* BOTTOM CENTER: COPYRIGHT ONLY */}
      <div className="max-w-7xl mx-auto border-t border-blue-900/50 mt-5 pt-3.5 flex items-center justify-center text-[10px] text-slate-400 text-center">
        <p>© 2026 BIS Sahayak. All rights reserved.</p>
      </div>
    </>
  );

  return (
    <footer className="w-full bg-[#071c36] text-white px-4 sm:px-8 lg:px-12 py-6 sm:py-7 z-20 shrink-0 border-t border-blue-950 font-sans select-none mt-auto">
      {footerInnerContent}
    </footer>
  );
}
