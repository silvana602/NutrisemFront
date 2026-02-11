"use client";

import React from "react";

interface ReportCardProps {
  title: string;
  value: string | number;
}

export const ReportCard: React.FC<ReportCardProps> = ({ title, value }) => {
  return (
    <div className="rounded border border-nutri-light-grey bg-nutri-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-nutri-dark-grey">{title}</h3>
      <p className="mt-2 text-2xl text-nutri-primary">{value}</p>
    </div>
  );
};
