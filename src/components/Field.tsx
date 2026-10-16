import React from "react";

type FieldProps = {
  label: string;
  htmlFor?: string;
  error?: React.ReactNode;
  children: React.ReactNode;
};

const Field = ({ label, htmlFor, error, children }: FieldProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="eyebrow" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error && (
        <p className="message--error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default Field;
