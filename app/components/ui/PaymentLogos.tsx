import type { ReactNode } from "react";
import { cn } from "./cn";

interface LogoFrameProps {
  label: string;
  background: string;
  className?: string;
  children: ReactNode;
}

function LogoFrame({ label, background, className, children }: LogoFrameProps) {
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex items-center justify-center rounded-md shadow-sm overflow-hidden",
        "h-7 w-12 shrink-0",
        className,
      )}
      style={{ background }}
    >
      {children}
    </span>
  );
}

function VisaLogo() {
  return (
    <LogoFrame label="Visa" background="#1A1F71">
      <svg
        viewBox="0 0 48 28"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        className="h-4 w-auto"
      >
        <text
          x="24"
          y="20"
          textAnchor="middle"
          fontFamily="'Helvetica Neue', Arial, sans-serif"
          fontWeight={900}
          fontSize="16"
          fontStyle="italic"
          letterSpacing="1"
          fill="#ffffff"
        >
          VISA
        </text>
      </svg>
    </LogoFrame>
  );
}

function MastercardLogo() {
  return (
    <LogoFrame label="Mastercard" background="#ffffff">
      <svg
        viewBox="0 0 48 28"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        className="h-5 w-auto"
      >
        <circle cx="19" cy="14" r="9" fill="#EB001B" />
        <circle cx="29" cy="14" r="9" fill="#F79E1B" />
        <path
          d="M24 7.5a9 9 0 0 0 0 13 9 9 0 0 0 0-13z"
          fill="#FF5F00"
        />
      </svg>
    </LogoFrame>
  );
}

function AmexLogo() {
  return (
    <LogoFrame label="American Express" background="#1F72CD">
      <svg
        viewBox="0 0 48 28"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        className="h-3 w-auto"
      >
        <text
          x="24"
          y="20"
          textAnchor="middle"
          fontFamily="'Helvetica Neue', Arial, sans-serif"
          fontWeight={900}
          fontSize="12"
          letterSpacing="0.5"
          fill="#ffffff"
        >
          AMEX
        </text>
      </svg>
    </LogoFrame>
  );
}

function ApplePayLogo() {
  return (
    <LogoFrame label="Apple Pay" background="#000000">
      <svg
        viewBox="0 0 48 20"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        className="h-4 w-auto"
      >
        <path
          fill="#ffffff"
          d="M13.6 5.7c-.5.6-1.3 1-2.1.9-.1-.8.3-1.7.8-2.2.5-.6 1.4-1 2.1-1 .1.8-.2 1.7-.8 2.3zm.8.9c-1.2-.1-2.2.7-2.7.7-.6 0-1.4-.6-2.3-.6-1.2 0-2.3.7-2.9 1.8-1.2 2.2-.3 5.4.9 7.2.6.9 1.3 1.8 2.2 1.8.9 0 1.2-.6 2.3-.6 1.1 0 1.4.6 2.3.6.9 0 1.6-.9 2.2-1.7.7-1 .9-1.9 1-2-.1 0-1.9-.7-1.9-2.9 0-1.8 1.5-2.7 1.6-2.7-.9-1.4-2.3-1.5-2.7-1.6z"
        />
        <text
          x="23"
          y="15"
          fontFamily="'Helvetica Neue', Arial, sans-serif"
          fontWeight={700}
          fontSize="11"
          fill="#ffffff"
        >
          Pay
        </text>
      </svg>
    </LogoFrame>
  );
}

function DiscoverLogo() {
  return (
    <LogoFrame label="Discover" background="#ffffff" className="border border-[#e5e5e5]">
      <svg
        viewBox="0 0 48 28"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        className="h-3.5 w-auto"
      >
        <text
          x="22"
          y="14"
          textAnchor="middle"
          fontFamily="'Helvetica Neue', Arial, sans-serif"
          fontWeight={800}
          fontSize="8"
          letterSpacing="0.5"
          fill="#111111"
        >
          DISCOVER
        </text>
        <circle cx="38" cy="13" r="4" fill="#FF6000" />
      </svg>
    </LogoFrame>
  );
}

function ShopPayLogo() {
  return (
    <LogoFrame label="Shop Pay" background="#5A31F4">
      <svg
        viewBox="0 0 48 20"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        className="h-3.5 w-auto"
      >
        <text
          x="24"
          y="14"
          textAnchor="middle"
          fontFamily="'Helvetica Neue', Arial, sans-serif"
          fontWeight={700}
          fontSize="11"
          fill="#ffffff"
        >
          shop Pay
        </text>
      </svg>
    </LogoFrame>
  );
}

interface PaymentLogosProps {
  className?: string;
}

export function PaymentLogos({ className }: PaymentLogosProps) {
  return (
    <ul
      aria-label="Accepted payment methods"
      className={cn(
        "flex flex-wrap items-center justify-center gap-sm",
        className,
      )}
    >
      <li>
        <VisaLogo />
      </li>
      <li>
        <MastercardLogo />
      </li>
      <li>
        <AmexLogo />
      </li>
      <li>
        <ApplePayLogo />
      </li>
      <li>
        <DiscoverLogo />
      </li>
      <li>
        <ShopPayLogo />
      </li>
    </ul>
  );
}
