"use client";

import React from "react";

interface ReportCardProps {
  title: string;
  value: string | number;
}

export const ReportCard: React.FC<ReportCardProps> = ({ title, value }) => {
  return (
    <div className="p-4 border rounded shadow-sm bg-white">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-2xl mt-2">{value}</p>
    </div>
  );
};
