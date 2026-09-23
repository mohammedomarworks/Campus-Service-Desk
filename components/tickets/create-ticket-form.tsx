"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Option = {
  id: string;
  name: string;
};

type CreateTicketFormProps = {
  categories: Option[];
  locations: Option[];
};

type FieldErrors = Record<string, string>;

export function CreateTicketForm({
  categories,
  locations,
}: CreateTicketFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [locationId, setLocationId] = useState("");

  const [errors, setErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setErrors({});
    setGeneralError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          categoryId,
          locationId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrors(result.error?.fields ?? {});
        setGeneralError(
          result.error?.message ?? "Unable to create ticket.",
        );
        return;
      }

      router.push(`/tickets/${result.data.id}`);
      router.refresh();
    } catch {
      setGeneralError(
        "A network error occurred. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {generalError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {generalError}
        </div>
      )}

      <div>
        <label
          htmlFor="title"
          className="mb-2 block text-sm font-medium"
        >
          Issue title
        </label>

        <input
          id="title"
          name="title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Example: Projector not working"
          className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
          maxLength={120}
        />

        {errors.title && (
          <p className="mt-2 text-sm text-red-600">
            {errors.title}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-2 block text-sm font-medium"
        >
          Description
        </label>

        <textarea
          id="description"
          name="description"
          rows={6}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe what is wrong and any useful details."
          className="w-full resize-y rounded-lg border px-4 py-3 outline-none focus:ring-2"
          maxLength={5000}
        />

        {errors.description && (
          <p className="mt-2 text-sm text-red-600">
            {errors.description}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="category"
          className="mb-2 block text-sm font-medium"
        >
          Category
        </label>

        <select
          id="category"
          name="category"
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:ring-2"
        >
          <option value="">Select a category</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        {errors.categoryId && (
          <p className="mt-2 text-sm text-red-600">
            {errors.categoryId}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="location"
          className="mb-2 block text-sm font-medium"
        >
          Location
        </label>

        <select
          id="location"
          name="location"
          value={locationId}
          onChange={(event) => setLocationId(event.target.value)}
          className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:ring-2"
        >
          <option value="">Select a location</option>

          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>

        {errors.locationId && (
          <p className="mt-2 text-sm text-red-600">
            {errors.locationId}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-black px-5 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Submitting..." : "Submit ticket"}
      </button>
    </form>
  );
}