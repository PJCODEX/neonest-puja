"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/Button";
import Chatbot from "./Chatbot";
import { useAuth } from "../context/AuthContext";
import { useChatStore } from "@/lib/store/chatStore";
import { Menu, X } from "lucide-react";
import NotificationBell from "./NotificationBell";
import { useAutoTask } from "../context/AutoTaskContext";
import AutoTask from "./AutoTask";

const tabs = [
  { label: "home", path: "/" },
  { label: "growth", path: "/Growth" },
  { label: "feeding", path: "/Feeding" },
  { label: "sleep", path: "/Sleep" },
  { label: "medical", path: "/Medical" },
  { label: "essentials", path: "/Essentials" },
  { label: "memories", path: "/Memories" },
  { label: "resources", path: "/Resources" },
  { label: "faqs", path: "/Faqs" },
  { label: "lullaby", path: "/Lullaby" },
];

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuth, logout } = useAuth();
  const { setAutoTask, isAutoTask } = useAutoTask();

  const [showModal, setShowModal] = useState(false);
  const [progress, setProgress] = useState(100);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);

  const handleLogout = () => {
    useChatStore.getState().clearChatHistory();
    logout();
    setShowModal(true);
    setProgress(100);
    setMenuOpen(false);
  };

  const handleDownloadPdf = async () => {
    try {
      setLoadingPdf(true);
      const currentUrl = window.location.href;
      const res = await fetch("/api/exportPdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: currentUrl }),
      });
      if (!res.ok) throw new Error("Failed to generate PDF");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "neonest-data.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("PDF download failed:", err);
    } finally {
      setLoadingPdf(false);
    }
  };

  useEffect(() => {
    if (!showModal) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 3.33;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [showModal]);

  useEffect(() => {
    if (progress <= 0 && showModal) {
      setShowModal(false);
      router.push("/");
    }
  }, [progress, showModal]);

  return (
    <>
      {/* Logout Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[999] flex items-center justify-center transition-all duration-300">
          <div className="bg-white px-6 py-5 rounded-xl shadow-lg text-center w-[320px]">
            <p className="text-gray-800 mb-3">
              Logged out successfully.{" "}
              <Link
                href="/Login"
                onClick={() => setShowModal(false)}
                className="text-pink-600 font-normal no-underline"
              >
                Login
              </Link>{" "}
              again!
            </p>
            <div className="w-full h-1 bg-pink-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-pink-500 transition-all duration-100"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between xl:pr-4">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image src="/logo.jpg" alt="NeoNest" width={60} height={60} />
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent ml-2">
                NeoNest
              </span>
            </Link>

            {/* Hamburger - Mobile */}
            <div className="md:hidden">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-pink-600 focus:outline-none"
                aria-label="Toggle menu"
              >
                {menuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>

            {/* Nav - Desktop */}
            <nav className="hidden xl:flex items-center gap-4">
              {tabs.map(({ label, path }) => (
                <Link
                  key={label}
                  href={path}
                  className={`transition-colors capitalize ${
                    pathname === path
                      ? "text-pink-600"
                      : "text-gray-600 hover:text-pink-600"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* CTA - Desktop */}
            <div className="hidden md:flex items-center space-x-2">
              {isAuth && <NotificationBell />}
              <Chatbot />
              <AutoTask setAutoTask={setAutoTask} isAutoTask={isAutoTask} />
              <Button
                onClick={handleDownloadPdf}
                disabled={loadingPdf}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
              >
                PDF{loadingPdf && "…"}
              </Button>
              {!isAuth ? (
                <>
                  <Button asChild className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white">
                    <Link href="/Login">Login</Link>
                  </Button>
                  <Button asChild className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white">
                    <Link href="/Signup">Signup</Link>
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                >
                  Logout
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="md:hidden mt-4 space-y-3">
              <div className="flex flex-col gap-3">
                {tabs.map(({ label, path }) => (
                  <Link
                    key={label}
                    href={path}
                    onClick={() => setMenuOpen(false)}
                    className={`block capitalize px-3 py-2 rounded-md text-sm ${
                      pathname === path
                        ? "text-pink-600 font-medium"
                        : "text-gray-700 hover:text-pink-600"
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {isAuth && <NotificationBell />}
                <Chatbot />
                <AutoTask setAutoTask={setAutoTask} isAutoTask={isAutoTask} />
                <Button
                  onClick={handleDownloadPdf}
                  disabled={loadingPdf}
                 className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"

                >
                  PDF{loadingPdf && "…"}
                </Button>
                {!isAuth ? (
                  <>
                    <Button asChild className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white">
                      <Link
                        href="/Login"
                        onClick={() => setMenuOpen(false)}
                      >
                        Login
                      </Link>
                    </Button>
                    <Button asChild className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white">
                      <Link
                        href="/Signup"
                        onClick={() => setMenuOpen(false)}
                      >
                        Signup
                      </Link>
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleLogout}
                    className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                  >
                    Logout
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Floating Mobile Chatbot & AutoTask */}
        <div className="md:hidden absolute right-0 top-1/2 transform -translate-y-1/2 flex flex-col items-end m-4">
          {pathname !== "/NeonestAi" && (
            <div className="m-1 mb-3 border-white rounded-full border-2">
              <Chatbot />
            </div>
          )}
          <div className="m-1 border-white rounded-full border-2">
            <AutoTask setAutoTask={setAutoTask} isAutoTask={isAutoTask} />
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;

