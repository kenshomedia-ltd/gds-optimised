// src/components/casino/CasinoHero/CasinoFeaturesTable.tsx

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGlobe,
  faCheckCircle,
} from "@awesome.me/kit-0e07a43543/icons/duotone/solid";
import type { CasinoFeature } from "@/types/casino-page.types";

interface CasinoFeaturesTableProps {
  features?: CasinoFeature[];
  translations: Record<string, string>;
}

export function CasinoFeaturesTable({
  features,
  translations,
}: CasinoFeaturesTableProps) {
  if (!features || features.length === 0) return null;

  return (
    <div className="casino-table-div p-2 bg-white rounded-lg">
      <table className="w-full">
        <thead>
          <tr>
            <th colSpan={2} className="p-0 text-white">
              <div className="summary-table-heading -mt-2 -mr-2 -ml-2 mb-2 rounded-t-lg flex p-3 bg-purple-700 items-center">
                <span className="block mr-4 bg-white rounded-full p-1">
                  <FontAwesomeIcon
                    icon={faGlobe}
                    className="w-6 h-6 text-purple-700"
                  />
                </span>
                <div className="font-bold">
                  {translations.features || "Features"}
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature, index) => (
            <tr
              key={feature.id}
              className={
                index !== features.length - 1 ? "border-b border-black" : ""
              }
            >
              <td className="p-2 w-10">
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="w-6 h-6 text-green-600"
                />
              </td>
              <td className="p-2">{feature.feature}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
