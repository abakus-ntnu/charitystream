import React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "gold";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const Button = ({
  variant = "primary",
  className = "",
  type = "button",
  children,
  ...rest
}: ButtonProps) => {
  return (
    <button
      type={type}
      {...rest}
      className={`button button--${variant} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
