// src/components/casino/CasinoHero/CasinoGeneralInfoTable.tsx

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faListCheck,
  faExternalLink,
  faPeople,
  faBadge,
  faPhone,
  faEnvelope,
} from "@awesome.me/kit-0e07a43543/icons/duotone/solid";
import type { GeneralInfo } from "@/types/casino-page.types";

interface CasinoGeneralInfoTableProps {
  generalInfo?: GeneralInfo;
  translations: Record<string, string>;
}

export function CasinoGeneralInfoTable({
  generalInfo,
  translations,
}: CasinoGeneralInfoTableProps) {
  if (!generalInfo) return null;

  const infoItems = [
    {
      icon: faExternalLink,
      label: translations.website || "Website",
      value: generalInfo.website,
    },
    {
      icon: faPeople,
      label: translations.society || "Society",
      value: generalInfo.societa,
    },
    {
      icon: faBadge,
      label: translations.license || "License",
      value: generalInfo.regulationLicense,
    },
    {
      icon: faPhone,
      label: translations.phone || "Phone",
      value: generalInfo.telephone,
    },
    {
      icon: faEnvelope,
      label: translations.email || "Email",
      value: generalInfo.email,
    },
  ].filter((item) => item.value);

  return (
    <div className="casino-table-div p-2 bg-white rounded-lg">
      <table className="w-full">
        <thead>
          <tr>
            <th colSpan={2} className="p-0 text-white">
              <div className="summary-table-heading -mt-2 -mr-2 -ml-2 mb-2 rounded-t-lg flex p-3 bg-purple-700 items-center">
                <span className="block mr-4 bg-white rounded-full p-1">
                  <FontAwesomeIcon
                    icon={faListCheck}
                    className="w-6 h-6 text-primary"
                  />
                </span>
                <div className="font-bold">
                  {translations.generalInfo || "General Info"}
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {infoItems.map((item, index) => (
            <tr
              key={index}
              className={
                index !== infoItems.length - 1 ? "border-b border-gray-200" : ""
              }
            >
              <td className="py-2">
                <div className="flex items-center">
                  <span className="block mr-2">
                    <FontAwesomeIcon
                      icon={item.icon}
                      className="w-5 h-5 text-primary"
                    />
                  </span>
                  {item.label}
                </div>
              </td>
              <td className="py-2 text-right font-semibold">{item.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
