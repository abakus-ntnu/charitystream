import React from "react";

const base =
  "rounded-xl border shadow-md p-4 relative overflow-hidden bg-bg-card border-border";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

const Card = ({ children, className = "", ...rest }: CardProps) => {
  return (
    <div {...rest} className={`${base} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
