"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { getMe, updateProfile } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type FormState = {
  name: string;
  phone: string;
};

export default function StudentProfilePage() {
  const router = useRouter();

  const { user, updateUser, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/");
      return;
    }

    if (user?.role === "admin") {
      router.replace("/admin");
      return;
    }

    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const response = await getMe();

        setForm({
          name: response.user.name || "",
          phone: response.user.phone || "",
        });

        updateUser(response.user);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your profile.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [isAuthenticated, router]);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setSuccess("");
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const trimmedName = form.name.trim();
    const trimmedPhone = form.phone.trim();

    if (trimmedName.length < 2) {
      setError("Name must contain at least 2 characters.");
      return;
    }

    if (!trimmedPhone) {
      setError("Please enter your phone number.");
      return;
    }

    try {
      setSaving(true);

      const response = await updateProfile({
        name: trimmedName,
        phone: trimmedPhone,
      });

      setForm({
        name: response.user.name || "",
        phone: response.user.phone || "",
      });

      updateUser(response.user);

      setSuccess("Your profile has been updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update your profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated || user?.role === "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <main className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-[72px] items-center justify-between px-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#800E13]">
                Student Portal
              </p>

              <h1 className="text-lg font-bold text-slate-900 sm:text-xl">
                My Profile
              </h1>
            </div>

            <div className="hidden items-center gap-3 sm:flex">
              <a
                href="/"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Browse JobWay
              </a>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#800E13] text-sm font-bold text-white">
                {(user?.name || "S").charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1120px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mb-6">
            <p className="text-sm text-slate-500">
              Manage your personal information and account details.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-5 sm:px-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#800E13]">
                    <UserRound className="h-6 w-6" />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Personal Information
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Keep your profile information up to date.
                    </p>
                  </div>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="p-5 sm:p-7"
              >
                {loading ? (
                  <div className="space-y-5">
                    <div>
                      <div className="mb-2 h-4 w-20 animate-pulse rounded bg-slate-200" />
                      <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
                    </div>

                    <div>
                      <div className="mb-2 h-4 w-20 animate-pulse rounded bg-slate-200" />
                      <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
                    </div>

                    <div>
                      <div className="mb-2 h-4 w-20 animate-pulse rounded bg-slate-200" />
                      <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="profile-name"
                          className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                          Full Name
                        </label>

                        <input
                          id="profile-name"
                          type="text"
                          value={form.name}
                          onChange={(event) =>
                            handleChange(
                              "name",
                              event.target.value,
                            )
                          }
                          maxLength={100}
                          autoComplete="name"
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#800E13] focus:ring-2 focus:ring-red-100"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="profile-email"
                          className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                          Email Address
                        </label>

                        <input
                          id="profile-email"
                          type="email"
                          value={user?.email || ""}
                          disabled
                          className="h-11 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500 outline-none"
                        />

                        <p className="mt-2 text-xs text-slate-400">
                          Email cannot be changed from your profile.
                        </p>
                      </div>

                      <div>
                        <label
                          htmlFor="profile-phone"
                          className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                          Phone Number
                        </label>

                        <input
                          id="profile-phone"
                          type="tel"
                          value={form.phone}
                          onChange={(event) =>
                            handleChange(
                              "phone",
                              event.target.value,
                            )
                          }
                          autoComplete="tel"
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#800E13] focus:ring-2 focus:ring-red-100"
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        {error}
                      </div>
                    )}

                    {success && (
                      <div className="mt-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{success}</span>
                      </div>
                    )}

                    <div className="mt-7 flex justify-end">
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#800E13] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#680b10] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Save className="h-4 w-4" />

                        {saving
                          ? "Saving..."
                          : "Save Changes"}
                      </button>
                    </div>
                  </>
                )}
              </form>
            </section>

            <aside className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#800E13] text-sm font-bold text-white">
                    {(user?.name || "S")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-900">
                      {user?.name || "Student"}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      {user?.email || ""}
                    </p>
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      Account Type
                    </span>

                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold capitalize text-[#800E13]">
                      {user?.role || "student"}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      Email Status
                    </span>

                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />

                      {user?.isEmailVerified
                        ? "Verified"
                        : "Pending"}
                    </span>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <ShieldCheck className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900">
                      Account Security
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Your account is protected with authenticated
                      access.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    alert(
                      "Password management will be available in the Account Settings module.",
                    );
                  }}
                  className="mt-5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Manage Security
                </button>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}