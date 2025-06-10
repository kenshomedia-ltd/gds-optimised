// src/app/test/ratings/page.tsx
"use client";

import { useState } from "react";
import { StarRating } from "@/components/ui/StarRating/StarRating";
import { StarRatingDisplay } from "@/components/ui/StarRating/StarRatingDisplay";
import { CasinoRating } from "@/components/casino/CasinoRating/CasinoRating";
import { toast, Toaster } from "sonner";

// Dummy casino data
const dummyCasinos = [
  {
    id: 1,
    title: "Royal Casino",
    slug: "royal-casino",
    ratingAvg: 4.5,
    ratingCount: 234,
  },
  {
    id: 2,
    title: "Golden Palace",
    slug: "golden-palace",
    ratingAvg: 3.8,
    ratingCount: 156,
  },
  {
    id: 3,
    title: "Lucky Stars",
    slug: "lucky-stars",
    ratingAvg: 4.9,
    ratingCount: 89,
  },
];

// Dummy game data
const dummyGames = [
  { id: 1, title: "Starburst", rating: 4.7, votes: 1234 },
  { id: 2, title: "Book of Dead", rating: 4.3, votes: 987 },
  { id: 3, title: "Gonzo's Quest", rating: 4.6, votes: 654 },
  { id: 4, title: "Mega Moolah", rating: 4.9, votes: 2345 },
];

export default function RatingsTestPage() {
  const [interactiveRating, setInteractiveRating] = useState(0);
  const [userRatings, setUserRatings] = useState<Record<number, number>>({});

  const handleRatingChange = (rating: number) => {
    setInteractiveRating(rating);
    toast.success(`You rated: ${rating} stars`);
  };

  const handleCasinoRating = (casinoId: number, rating: number) => {
    setUserRatings((prev) => ({ ...prev, [casinoId]: rating }));
    toast.success(`Rated casino ${casinoId}: ${rating} stars`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Toaster position="top-right" />

      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Star Rating Components Test Page
        </h1>

        {/* Section 1: Interactive Star Rating */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            1. Interactive Star Rating
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                Default Size (md)
              </h3>
              <StarRating
                initialRating={3.5}
                onRatingChange={handleRatingChange}
                size="md"
              />
              <p className="mt-2 text-sm text-gray-600">
                Current rating: {interactiveRating || 3.5}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                Large Size
              </h3>
              <StarRating
                initialRating={4}
                onRatingChange={handleRatingChange}
                size="lg"
                showValue={true}
              />
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                Small Size - No Value Display
              </h3>
              <StarRating
                initialRating={2.5}
                onRatingChange={handleRatingChange}
                size="sm"
                showValue={false}
              />
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                Value Position Bottom
              </h3>
              <StarRating
                initialRating={4.5}
                onRatingChange={handleRatingChange}
                size="md"
                valuePosition="bottom"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Readonly Star Rating */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            2. Readonly Star Rating
          </h2>

          <div className="space-y-4">
            <div className="flex items-center gap-8">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  Small
                </h3>
                <StarRating initialRating={3.7} readonly={true} size="sm" />
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  Medium
                </h3>
                <StarRating initialRating={4.2} readonly={true} size="md" />
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  Large
                </h3>
                <StarRating initialRating={4.8} readonly={true} size="lg" />
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Star Rating Display */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            3. Star Rating Display (Lightweight)
          </h2>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-3">
                  Standard Display
                </h3>
                <div className="space-y-3">
                  <StarRatingDisplay rating={4.5} size="xs" />
                  <StarRatingDisplay rating={3.8} size="sm" />
                  <StarRatingDisplay rating={4.2} size="md" />
                  <StarRatingDisplay rating={4.9} size="lg" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-3">
                  With Vote Count
                </h3>
                <div className="space-y-3">
                  <StarRatingDisplay
                    rating={4.5}
                    size="sm"
                    showCount={true}
                    count={123}
                  />
                  <StarRatingDisplay
                    rating={3.8}
                    size="md"
                    showCount={true}
                    count={456}
                  />
                  <StarRatingDisplay
                    rating={4.2}
                    size="lg"
                    showCount={true}
                    count={789}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                Compact Mode
              </h3>
              <div className="space-y-2">
                {dummyGames.map((game) => (
                  <div
                    key={game.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded"
                  >
                    <span className="font-medium">{game.title}</span>
                    <StarRatingDisplay
                      rating={game.rating}
                      size="sm"
                      compact={true}
                      count={game.votes}
                      showCount={true}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                Value Position Bottom
              </h3>
              <div className="flex gap-8">
                <StarRatingDisplay
                  rating={4.3}
                  size="md"
                  valuePosition="bottom"
                />
                <StarRatingDisplay
                  rating={4.7}
                  size="md"
                  valuePosition="bottom"
                  showCount={true}
                  count={234}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Casino Rating Component */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            4. Casino Rating Component
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dummyCasinos.map((casino) => (
              <div
                key={casino.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  {casino.title}
                </h3>
                <CasinoRating
                  ratingAvg={casino.ratingAvg}
                  ratingCount={casino.ratingCount}
                  casinoSlug={casino.slug}
                  casinoTitle={casino.title}
                  showVotes={true}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Interactive Casino Ratings */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            5. Interactive Casino Ratings
          </h2>

          <div className="space-y-4">
            {dummyCasinos.map((casino) => (
              <div
                key={casino.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {casino.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Average: {casino.ratingAvg} ({casino.ratingCount} reviews)
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-2">Your Rating:</p>
                    <StarRating
                      initialRating={userRatings[casino.id] || 0}
                      onRatingChange={(rating) =>
                        handleCasinoRating(casino.id, rating)
                      }
                      size="md"
                      showValue={true}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 6: Different States */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            6. Edge Cases & States
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Zero Rating
              </h3>
              <StarRatingDisplay rating={0} size="md" />
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Perfect Score
              </h3>
              <StarRatingDisplay rating={5} size="md" />
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Fractional (0.1)
              </h3>
              <StarRatingDisplay rating={3.1} size="md" />
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Fractional (0.5)
              </h3>
              <StarRatingDisplay rating={3.5} size="md" />
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Fractional (0.9)
              </h3>
              <StarRatingDisplay rating={3.9} size="md" />
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Custom Max Rating (10)
              </h3>
              <StarRatingDisplay rating={7.5} maxRating={10} size="sm" />
            </div>
          </div>
        </section>

        {/* Code Examples */}
        <section className="bg-gray-900 text-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-2xl font-semibold mb-6">Usage Examples</h2>

          <pre className="overflow-x-auto">
            <code className="text-sm">{`// Interactive Rating
<StarRating
  initialRating={3.5}
  onRatingChange={(rating) => console.log(rating)}
  size="md"
/>

// Readonly Rating
<StarRating
  initialRating={4.5}
  readonly={true}
  size="lg"
/>

// Display Only (Lightweight)
<StarRatingDisplay
  rating={4.2}
  size="md"
  showCount={true}
  count={123}
/>

// Compact Display
<StarRatingDisplay
  rating={4.7}
  size="sm"
  compact={true}
  count={456}
/>

// Casino Rating Component
<CasinoRating
  ratingAvg={4.5}
  ratingCount={234}
  casinoSlug="royal-casino"
  casinoTitle="Royal Casino"
/>`}</code>
          </pre>
        </section>
      </div>
    </div>
  );
}
