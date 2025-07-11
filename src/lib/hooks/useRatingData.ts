import { useState, useEffect } from "react";
import { fetchRatingData } from "@/lib/api/rating-fetcher";

export function useRatingData(
  documentId?: string | number,
  type: "games" | "casinos" = "games",
  initialRating: number = 0,
  initialCount: number = 0
) {
  const [ratingAvg, setRatingAvg] = useState(initialRating);
  const [ratingCount, setRatingCount] = useState(initialCount);

  useEffect(() => {
    if (!documentId) return;

    fetchRatingData(String(documentId), type).then((data) => {
      if (data) {
        setRatingAvg(data.ratingAvg);
        setRatingCount(data.ratingCount);
      }
    });
  }, [documentId, type]);

  return { ratingAvg, ratingCount };
}
