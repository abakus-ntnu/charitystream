import React from "react";

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

const Section = ({ title, children }: SectionProps) => {
  return (
    <section className="flex flex-col gap-4 py-8 border-t-2 border-border-dim first:border-t-0 first:pt-2">
      <h2 className="page-title">{title}</h2>
      {children}
    </section>
  );
};

export default Section;
