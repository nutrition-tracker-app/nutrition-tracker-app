import React from 'react';
import { FaEnvelope, FaGithub, FaFileAlt, FaLock } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="bg-[#efffce] border border-black px-4 py-2 mt-auto w-full">
      {/* Footer Links */}
      <div className="flex justify-start">
        <div className="flex flex-wrap space-x-5 text-black md:text-sm font-medium">
          {/* Contact */}
          <a href="#" className="flex items-center hover:text-gray-400">
            <FaEnvelope className="mr-2" /> Contact
          </a>

          {/* Github */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center hover:text-gray-400"
          >
            <FaGithub className="mr-2" /> GitHub
          </a>

          {/* Terms */}
          <a href="#" className="flex items-center hover:text-gray-400">
            <FaFileAlt className="mr-2" /> Terms
          </a>

          {/* Privacy */}
          <a href="#" className="flex items-center hover:text-gray-400">
            <FaLock className="mr-2" /> Privacy
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
