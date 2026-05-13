"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import {
  Box,
  Button,
  Divider,
  Drawer,
  FormField,
  Heading,
  Icon,
  IconButton,
  Modal,
  Row,
  Stack,
  Text,
  TextField,
  TextLink,
} from "@/app/components/ui";
import { useMediaQuery } from "@/app/lib/hooks/use-media-query";

type AuthView = "signin" | "signup" | "forgot";
type ForgotStatus = "idle" | "sent";

interface ViewCopy {
  title: string;
  subtitle: string;
  googleLabel?: string;
}

const VIEW_COPY: Record<AuthView, ViewCopy> = {
  signin: {
    title: "Welcome back",
    subtitle: "Sign in to continue your AdiCon ritual.",
    googleLabel: "Sign in with Google",
  },
  signup: {
    title: "Join AdiCon",
    subtitle: "Create your account to unlock member pricing.",
    googleLabel: "Sign up with Google",
  },
  forgot: {
    title: "Forgot your password?",
    subtitle:
      "Enter the email tied to your account and we'll send you a link to reset it.",
  },
};

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  initialView?: AuthView;
}

export function AuthModal({
  open,
  onClose,
  initialView = "signin",
}: AuthModalProps) {
  const [view, setView] = useState<AuthView>(initialView);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState<ForgotStatus>("idle");
  const isMobile = useMediaQuery("(max-width: 767px)");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onClose();
  };

  const onForgotSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setForgotStatus("sent");
  };

  const goToSignIn = () => {
    setForgotStatus("idle");
    setForgotEmail("");
    setView("signin");
  };

  const copy = VIEW_COPY[view];

  const body = (
    <AuthBody
      view={view}
      copy={copy}
      onViewChange={setView}
      onSubmit={onSubmit}
      onForgotSubmit={onForgotSubmit}
      onBackToSignIn={goToSignIn}
      forgotEmail={forgotEmail}
      onForgotEmailChange={setForgotEmail}
      forgotStatus={forgotStatus}
    />
  );

  if (isMobile) {
    return (
      <Drawer
        open={open}
        onClose={onClose}
        anchor="right"
        width="sm"
        ariaLabel={copy.title}
      >
        <Row
          justify="between"
          align="center"
          className="px-lg py-md border-b border-outline-variant bg-surface shrink-0"
        >
          <Heading level={2} variant="headline-sm">
            Account
          </Heading>
          <IconButton
            icon="close"
            label="Close"
            size="sm"
            variant="plain"
            onClick={onClose}
          />
        </Row>
        <Box className="flex-1 overflow-y-auto bg-surface">{body}</Box>
      </Drawer>
    );
  }

  return (
    <Modal open={open} onClose={onClose} width="md" ariaLabel={copy.title}>
      <Box className="absolute top-sm right-sm z-10">
        <IconButton
          icon="close"
          label="Close"
          size="sm"
          variant="plain"
          onClick={onClose}
        />
      </Box>
      <Box className="flex-1 overflow-y-auto">{body}</Box>
    </Modal>
  );
}

interface AuthBodyProps {
  view: AuthView;
  copy: ViewCopy;
  onViewChange: (next: AuthView) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onForgotSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onBackToSignIn: () => void;
  forgotEmail: string;
  onForgotEmailChange: (value: string) => void;
  forgotStatus: ForgotStatus;
}

function AuthBody({
  view,
  copy,
  onViewChange,
  onSubmit,
  onForgotSubmit,
  onBackToSignIn,
  forgotEmail,
  onForgotEmailChange,
  forgotStatus,
}: AuthBodyProps) {
  const isForgot = view === "forgot";
  const forgotSent = isForgot && forgotStatus === "sent";

  return (
    <Stack gap="lg" align="center" className="px-lg sm:px-xl pt-xl pb-lg">
      <Stack gap="xs" align="center" className="px-lg">
        {forgotSent ? (
          <Box className="w-12 h-12 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center mb-sm">
            <Icon
              name="mark_email_read"
              filled
              className="text-primary text-xl"
            />
          </Box>
        ) : null}
        <Heading level={2} variant="headline-md" align="center">
          {forgotSent ? "Check your inbox" : copy.title}
        </Heading>
        <Text variant="body-sm" tone="muted" align="center">
          {forgotSent ? (
            <>
              If an AdiCon account exists for{" "}
              <Text as="span" variant="body-sm" className="font-bold">
                {forgotEmail}
              </Text>
              , a reset link is on its way. The link is valid for 30 minutes.
            </>
          ) : (
            copy.subtitle
          )}
        </Text>
      </Stack>

      {!isForgot && (
        <Row
          gap="none"
          align="stretch"
          className="w-full bg-surface-container-low rounded-lg p-xs border border-outline-variant"
        >
          <TabButton
            active={view === "signin"}
            onClick={() => onViewChange("signin")}
          >
            Sign in
          </TabButton>
          <TabButton
            active={view === "signup"}
            onClick={() => onViewChange("signup")}
          >
            Create account
          </TabButton>
        </Row>
      )}

      {view === "signin" && (
        <SignInForm
          onSubmit={onSubmit}
          onForgotPassword={() => onViewChange("forgot")}
        />
      )}
      {view === "signup" && <SignUpForm onSubmit={onSubmit} />}
      {isForgot && !forgotSent && (
        <ForgotForm
          email={forgotEmail}
          onEmailChange={onForgotEmailChange}
          onSubmit={onForgotSubmit}
        />
      )}

      {isForgot ? (
        <TextLink
          href="#"
          variant="muted"
          onClick={(event) => {
            event.preventDefault();
            onBackToSignIn();
          }}
        >
          Back to sign in
        </TextLink>
      ) : (
        <>
          <Row align="center" gap="md" className="w-full">
            <Box className="flex-1">
              <Divider />
            </Box>
            <Text
              variant="label-caps"
              tone="muted"
              className="text-[10px] tracking-widest whitespace-nowrap"
              as="span"
            >
              Or continue with
            </Text>
            <Box className="flex-1">
              <Divider />
            </Box>
          </Row>

          <Button
            variant="outline"
            size="md"
            fullWidth
            className="gap-sm normal-case tracking-normal"
          >
            <Icon name="google" className="text-xl" />
            <Text as="span" variant="body-md">
              {copy.googleLabel}
            </Text>
          </Button>

          <Text
            variant="body-sm"
            tone="muted"
            align="center"
            className="text-[12px] px-md"
          >
            By continuing, you agree to AdiCon&apos;s{" "}
            <TextLink href="#" variant="default">
              Terms of Service
            </TextLink>{" "}
            and{" "}
            <TextLink href="#" variant="default">
              Privacy Policy
            </TextLink>
            .
          </Text>
        </>
      )}
    </Stack>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}

function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <Button
      variant={active ? "primary" : "ghost"}
      size="sm"
      fullWidth
      onClick={onClick}
      className={`rounded-md tracking-[0.18em] ${
        active ? "shadow-sm" : "text-on-surface-variant"
      }`}
    >
      {children}
    </Button>
  );
}

interface FormProps {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

interface SignInFormProps extends FormProps {
  onForgotPassword: () => void;
}

function SignInForm({ onSubmit, onForgotPassword }: SignInFormProps) {
  return (
    <form onSubmit={onSubmit} className="w-full">
      <Stack gap="md">
        <FormField label="Email address" required>
          <TextField
            type="email"
            autoComplete="email"
            placeholder="e.g. grace@adicon.com"
          />
        </FormField>

        <Stack gap="xs">
          <Row justify="between" align="center">
            <Text
              variant="label-caps"
              tone="muted"
              className="text-[11px] tracking-[0.08em]"
              as="span"
            >
              Password
            </Text>
            <TextLink
              href="#"
              variant="default"
              className="text-body-sm"
              onClick={(event) => {
                event.preventDefault();
                onForgotPassword();
              }}
            >
              Forgot password?
            </TextLink>
          </Row>
          <TextField
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
          />
        </Stack>

        <Button type="submit" variant="primary" size="md" fullWidth>
          Sign in to your account
        </Button>
      </Stack>
    </form>
  );
}

function SignUpForm({ onSubmit }: FormProps) {
  return (
    <form onSubmit={onSubmit} className="w-full">
      <Stack gap="md">
        <FormField label="Full name" required>
          <TextField
            type="text"
            autoComplete="name"
            placeholder="Grace Adeyemi"
          />
        </FormField>

        <FormField label="Email address" required>
          <TextField
            type="email"
            autoComplete="email"
            placeholder="e.g. grace@adicon.com"
          />
        </FormField>

        <FormField
          label="Password"
          required
          hint="At least 8 characters with a number"
        >
          <TextField
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
          />
        </FormField>

        <Button type="submit" variant="primary" size="md" fullWidth>
          Create my account
        </Button>
      </Stack>
    </form>
  );
}

interface ForgotFormProps extends FormProps {
  email: string;
  onEmailChange: (value: string) => void;
}

function ForgotForm({ email, onEmailChange, onSubmit }: ForgotFormProps) {
  return (
    <form onSubmit={onSubmit} className="w-full">
      <Stack gap="md">
        <FormField label="Email address" required>
          <TextField
            type="email"
            autoComplete="email"
            placeholder="e.g. grace@adicon.com"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            required
          />
        </FormField>

        <Button type="submit" variant="primary" size="md" fullWidth>
          Send reset link
        </Button>
      </Stack>
    </form>
  );
}
