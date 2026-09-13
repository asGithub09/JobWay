"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ImagePlus,
  Megaphone,
  Upload,
  Trash2,
  Power,
  Loader2,
} from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

type Advertisement = {
  _id: string;
  name: string;
  imageUrl: string;
  title?: string;
  description?: string;
  ctaText: string;
  displayDelay: number;
  placement: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function AdvertisementsPage() {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const [name, setName] = useState("Landing Page Advertisement");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ctaText, setCtaText] = useState("Get Enrolled");
  const [displayDelay, setDisplayDelay] = useState("5");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const getToken = () =>
    typeof window !== "undefined"
      ? localStorage.getItem("jobway_token")
      : null;

  const loadAdvertisements = async () => {
    try {
      setLoading(true);

      const token = getToken();

      const response = await fetch(`${API_BASE_URL}/advertisements`, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to load advertisements");
      }

      setAdvertisements(data.advertisements || []);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to load advertisements",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdvertisements();
  }, []);

  const handleImageChange = (file: File | null) => {
    setImage(file);

    if (!file) {
      setPreview("");
      return;
    }

    setPreview(URL.createObjectURL(file));
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!image) {
      setMessage("Please select an advertisement image.");
      return;
    }

    try {
      setUploading(true);
      setMessage("");

      const token = getToken();

      if (!token) {
        throw new Error("Admin authentication required.");
      }

      const formData = new FormData();

      formData.append("image", image);
      formData.append("name", name);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("ctaText", ctaText);
      formData.append("displayDelay", displayDelay);
      formData.append("isActive", "true");

      const response = await fetch(`${API_BASE_URL}/advertisements`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to create advertisement");
      }

      setMessage("Advertisement published successfully.");
      setImage(null);
      setPreview("");
      setTitle("");
      setDescription("");
      setCtaText("Get Enrolled");
      setDisplayDelay("5");

      await loadAdvertisements();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to create advertisement",
      );
    } finally {
      setUploading(false);
    }
  };

  const toggleAdvertisement = async (advertisement: Advertisement) => {
    try {
      const token = getToken();

      if (!token) {
        throw new Error("Admin authentication required.");
      }

      const response = await fetch(
        `${API_BASE_URL}/advertisements/${advertisement._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            isActive: !advertisement.isActive,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to update advertisement");
      }

      await loadAdvertisements();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to update advertisement",
      );
    }
  };

  const deleteAdvertisement = async (advertisement: Advertisement) => {
    if (!window.confirm("Delete this advertisement?")) return;

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Admin authentication required.");
      }

      const response = await fetch(
        `${API_BASE_URL}/advertisements/${advertisement._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to delete advertisement");
      }

      await loadAdvertisements();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to delete advertisement",
      );
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <Link
            href="/admin"
            className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Dashboard
          </Link>

          <div className="rounded-[28px] border border-violet-100 bg-gradient-to-br from-white via-violet-50/70 to-fuchsia-50/60 p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-violet-700">
                  <Megaphone className="h-3.5 w-3.5" />
                  Website Management
                </div>

                <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Advertisements
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  Upload and control the promotional advertisement displayed
                  on the JobWay landing page.
                </p>
              </div>

              <div className="rounded-2xl border border-white bg-white/80 px-5 py-4 shadow-sm backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Active Ads
                </p>
                <p className="mt-1 text-2xl font-black text-slate-950">
                  {advertisements.filter((item) => item.isActive).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <form
            onSubmit={handleCreate}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <ImagePlus className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-950">
                  Create Advertisement
                </h2>
                <p className="text-sm text-slate-500">
                  The new advertisement can become the active landing banner.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-slate-700">
                  Advertisement Image
                </span>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) =>
                    handleImageChange(event.target.files?.[0] || null)
                  }
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm"
                />
              </label>

              {preview && (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                  <img
                    src={preview}
                    alt="Advertisement preview"
                    className="max-h-64 w-full object-contain"
                  />
                </div>
              )}

              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-slate-700">
                  Name
                </span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-500"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-slate-700">
                  Title
                </span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Example: Start your JobWay journey"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-500"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-slate-700">
                  Description
                </span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  placeholder="Short promotional message..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-500"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-slate-700">
                    CTA Text
                  </span>
                  <input
                    value={ctaText}
                    onChange={(event) => setCtaText(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-500"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-slate-700">
                    Display Delay (seconds)
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={displayDelay}
                    onChange={(event) => setDisplayDelay(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-500"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {uploading ? "Uploading..." : "Publish Advertisement"}
              </button>
            </div>
          </form>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-black text-slate-950">
                Advertisement Library
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Only one landing advertisement is active at a time.
              </p>
            </div>

            {loading ? (
              <div className="flex min-h-48 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
              </div>
            ) : advertisements.length === 0 ? (
              <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
                <Megaphone className="mb-3 h-8 w-8 text-slate-300" />
                <p className="font-bold text-slate-700">
                  No advertisements yet
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Upload your first landing-page advertisement.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {advertisements.map((advertisement) => (
                  <article
                    key={advertisement._id}
                    className="overflow-hidden rounded-2xl border border-slate-200"
                  >
                    <div className="aspect-[16/6] bg-slate-100">
                      <img
                        src={advertisement.imageUrl}
                        alt={advertisement.title || advertisement.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-black text-slate-900">
                            {advertisement.title || advertisement.name}
                          </h3>

                          {advertisement.description && (
                            <p className="mt-1 text-sm leading-5 text-slate-500">
                              {advertisement.description}
                            </p>
                          )}
                        </div>

                        <span
                          className={
                            advertisement.isActive
                              ? "rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700"
                              : "rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-500"
                          }
                        >
                          {advertisement.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            toggleAdvertisement(advertisement)
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                        >
                          <Power className="h-3.5 w-3.5" />
                          {advertisement.isActive ? "Deactivate" : "Activate"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteAdvertisement(advertisement)
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-red-100 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
