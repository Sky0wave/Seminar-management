'use client';

import { useState } from 'react';
import { QrCode, X, Download, Copy, Check } from 'lucide-react';

export default function QRCodeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const url = 'https://medseminar.vercel.app/';

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        title="Show Mobile QR Code"
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gray-800/80 border border-gray-700 text-xs font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
      >
        <QrCode className="h-4 w-4 text-blue-400" />
        <span className="hidden sm:inline">QR Code</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden text-center p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2 text-left">
                <div className="p-2 bg-blue-950/70 border border-blue-700/60 rounded-xl text-blue-400">
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Scan for Mobile Access</h3>
                  <p className="text-[11px] text-gray-400">Seminar Timetable &amp; Bookings</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-200 p-1 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* QR Card */}
            <div className="bg-white p-4 rounded-2xl inline-block shadow-lg mx-auto border-4 border-gray-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/medseminar-qr.png"
                alt="MedSeminar QR Code"
                className="w-52 h-52 object-contain"
              />
            </div>

            {/* URL Display */}
            <div className="bg-gray-950 border border-gray-800 rounded-xl p-2.5 flex items-center justify-between text-xs">
              <span className="text-blue-400 font-mono truncate mr-2">{url}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors flex items-center space-x-1 shrink-0"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Download Link */}
            <div className="flex items-center space-x-2 pt-1">
              <a
                href="/medseminar-qr.png"
                download="medseminar-qr.png"
                className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-md"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download PNG</span>
              </a>
              <a
                href="/medseminar-qr.svg"
                download="medseminar-qr.svg"
                className="py-2 px-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-xl text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors"
              >
                <span>Vector SVG</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
