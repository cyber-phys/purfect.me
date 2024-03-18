import React, { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = {
  img: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  height?: number|string;
  width?: number|string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const ButtonImg: React.FC<ButtonProps> = ({
  img,
  children,
  className,
  disabled,
  height,
  width,
  ...allProps
}) => {
  return (
    <button
      className={`flex flex-row ${
        disabled ? "pointer-events-none" : ""
      } text-gray-950 text-sm justify-center border border-transparent px-3 py-1 rounded-md transition ease-out duration-250 hover:bg-transparent active:scale-[0.98] ${className}`}
      {...allProps}
    >
      <img src={img} style={{ width: height, height: width }}/>
      {children}
    </button>
  );
};
