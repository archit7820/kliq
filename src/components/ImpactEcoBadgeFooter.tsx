
import React from "react";

type EcoInsight = { id: string; insight: string; created_at: string };
type ImpactEcoBadgeFooterProps = {
  ecoInsights: EcoInsight[];
};

const ImpactEcoBadgeFooter: React.FC<ImpactEcoBadgeFooterProps> = ({ ecoInsights }) => (
  <div className="flex w-full justify-between items-center flex-wrap mt-3 gap-2">
    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 border text-xs text-gray-700 shadow">
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/4/4a/OpenAI_Logo.svg"
        alt="OpenAI"
        width={20}
        height={20}
        style={{ display: 'inline', verticalAlign: 'middle' }}
      />
      <span className="font-semibold">Eco insights powered by OpenAI</span>
    </span>
    {/* Live insights */}
    <div className="flex flex-col items-end gap-0">
      <span className="text-[12px] mb-1 font-semibold text-green-700">Your Latest Eco Insights:</span>
      <ol className="text-green-700 text-xs text-right">
        {ecoInsights.length === 0 && (
          <span className="text-gray-400 text-xs">No eco insights yet.</span>
        )}
        {ecoInsights.slice(0,2).map((i: any) =>
          <li key={i.id} className="mb-0.5">
            {i.insight} <span className="block text-[10px] text-gray-400">{new Date(i.created_at).toLocaleDateString()}</span>
          </li>
        )}
      </ol>
    </div>
  </div>
);

export default ImpactEcoBadgeFooter;
