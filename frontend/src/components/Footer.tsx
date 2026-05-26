import React from "react";

export default function Footer() {
  return (
    <footer className="border-t border-outline-variant bg-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 md:grid-cols-3 md:px-8">
        <div>
          <h4 className="text-lg font-bold text-astu-navy">ASTU AMS</h4>
          <p className="mt-2 text-sm text-on-surface-variant">Adama Science and Technology University Alumni Management System.</p>
        </div>
        <div>
          <h5 className="text-sm font-semibold text-astu-navy">Quick Links</h5>
          <div className="mt-2 flex flex-col gap-1 text-sm text-on-surface-variant">
            <a href="#alumni">Alumni Network</a>
            <a href="#jobs">Job Board</a>
            <a href="#events">Events</a>
          </div>
        </div>
        <div>
          <h5 className="text-sm font-semibold text-astu-navy">Contact</h5>
          <p className="mt-2 text-sm text-on-surface-variant">Email: alumni@astu.edu.et</p>
          <p className="text-sm text-on-surface-variant">Phone: +251 22 111 2233</p>
        </div>
      </div>
    </footer>
  );
}
