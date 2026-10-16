import React from "react";

const base = "p-5 relative overflow-hidden bg-panel";

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
