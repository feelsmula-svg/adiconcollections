"use client";

import { useRouter } from "next/navigation";
import {
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
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
import { useAuthStore, type FieldErrors } from "@/app/lib/state/auth-store";

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
  const isMobile = useMediaQuery("(max-width: 767px)");

  const copy = VIEW_COPY[view];

  const body = (
    <AuthBody
      view={view}
      copy={copy}
      onViewChange={setView}
      onSuccess={onClose}
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
  onSuccess: () => void;
}

function AuthBody({ view, copy, onViewChange, onSuccess }: AuthBodyProps) {
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState<ForgotStatus>("idle");

  const isForgot = view === "forgot";
  const forgotSent = isForgot && forgotStatus === "sent";

  const goToSignIn = () => {
    setForgotStatus("idle");
    setForgotEmail("");
    onViewChange("signin");
  };

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
          onSuccess={onSuccess}
          onForgotPassword={() => onViewChange("forgot")}
        />
      )}
      {view === "signup" && <SignUpForm onSuccess={onSuccess} />}
      {isForgot && !forgotSent && (
        <ForgotForm
          email={forgotEmail}
          onEmailChange={setForgotEmail}
          onSent={() => setForgotStatus("sent")}
        />
      )}

      {isForgot ? (
        <TextLink
          href="#"
          variant="muted"
          onClick={(event) => {
            event.preventDefault();
            goToSignIn();
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
            disabled
            title="Google sign-in not yet wired up"
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
            <TextLink href="/legal/terms" variant="default">
              Terms of Service
            </TextLink>{" "}
            and{" "}
            <TextLink href="/legal/privacy-policy" variant="default">
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

interface FormError {
  message: string | null;
  fieldErrors: FieldErrors;
}

const EMPTY_ERROR: FormError = { message: null, fieldErrors: {} };

function firstFieldError(
  errors: FieldErrors,
  key: string,
): string | undefined {
  const list = errors[key];
  return Array.isArray(list) && list.length > 0 ? list[0] : undefined;
}

interface SignInFormProps {
  onSuccess: () => void;
  onForgotPassword: () => void;
}

function SignInForm({ onSuccess, onForgotPassword }: SignInFormProps) {
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<FormError>(EMPTY_ERROR);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(EMPTY_ERROR);
    const result = await signIn({ email, password });
    if (result.ok) {
      onSuccess();
      if (result.user.role === "admin") {
        router.push("/admin");
      }
      router.refresh();
      return;
    }
    setSubmitting(false);
    setError({
      message: result.error,
      fieldErrors: result.fieldErrors ?? {},
    });
  };

  return (
    <form onSubmit={onSubmit} className="w-full" noValidate>
      <Stack gap="md">
        {error.message ? (
          <Text
            variant="body-sm"
            tone="error"
            role="alert"
            className="text-[12px]"
          >
            {error.message}
          </Text>
        ) : null}

        <FormField
          label="Email address"
          required
          error={firstFieldError(error.fieldErrors, "email")}
        >
          <TextField
            type="email"
            autoComplete="email"
            placeholder="e.g. grace@adicon.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={submitting}
            required
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
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={submitting}
            invalid={Boolean(firstFieldError(error.fieldErrors, "password"))}
            required
          />
          {firstFieldError(error.fieldErrors, "password") ? (
            <Text variant="body-sm" tone="error" className="text-[11px]">
              {firstFieldError(error.fieldErrors, "password")}
            </Text>
          ) : null}
        </Stack>

        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          disabled={submitting}
        >
          {submitting ? "Signing in…" : "Sign in to your account"}
        </Button>
      </Stack>
    </form>
  );
}

interface SignUpFormProps {
  onSuccess: () => void;
}

function SignUpForm({ onSuccess }: SignUpFormProps) {
  const router = useRouter();
  const signUp = useAuthStore((s) => s.signUp);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<FormError>(EMPTY_ERROR);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(EMPTY_ERROR);
    const result = await signUp({ name, email, password });
    if (result.ok) {
      onSuccess();
      if (result.user.role === "admin") {
        router.push("/admin");
      }
      router.refresh();
      return;
    }
    setSubmitting(false);
    setError({
      message: result.error,
      fieldErrors: result.fieldErrors ?? {},
    });
  };

  return (
    <form onSubmit={onSubmit} className="w-full" noValidate>
      <Stack gap="md">
        {error.message ? (
          <Text
            variant="body-sm"
            tone="error"
            role="alert"
            className="text-[12px]"
          >
            {error.message}
          </Text>
        ) : null}

        <FormField
          label="Full name"
          required
          error={firstFieldError(error.fieldErrors, "name")}
        >
          <TextField
            type="text"
            autoComplete="name"
            placeholder="Grace Adeyemi"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={submitting}
            required
          />
        </FormField>

        <FormField
          label="Email address"
          required
          error={firstFieldError(error.fieldErrors, "email")}
        >
          <TextField
            type="email"
            autoComplete="email"
            placeholder="e.g. grace@adicon.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={submitting}
            required
          />
        </FormField>

        <FormField
          label="Password"
          required
          hint="At least 8 characters with a number"
          error={firstFieldError(error.fieldErrors, "password")}
        >
          <TextField
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={submitting}
            required
          />
        </FormField>

        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          disabled={submitting}
        >
          {submitting ? "Creating account…" : "Create my account"}
        </Button>
      </Stack>
    </form>
  );
}

interface ForgotFormProps {
  email: string;
  onEmailChange: (value: string) => void;
  onSent: () => void;
}

function ForgotForm({ email, onEmailChange, onSent }: ForgotFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<FormError>(EMPTY_ERROR);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(EMPTY_ERROR);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        onSent();
        return;
      }
      const data = (await res.json().catch(() => null)) as {
        error?: string;
        fieldErrors?: FieldErrors;
      } | null;
      setError({
        message: data?.error ?? "Could not send reset email. Please try again.",
        fieldErrors: data?.fieldErrors ?? {},
      });
    } catch {
      setError({
        message: "Network error. Please try again.",
        fieldErrors: {},
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="w-full" noValidate>
      <Stack gap="md">
        {error.message ? (
          <Text
            variant="body-sm"
            tone="error"
            role="alert"
            className="text-[12px]"
          >
            {error.message}
          </Text>
        ) : null}

        <FormField
          label="Email address"
          required
          error={firstFieldError(error.fieldErrors, "email")}
        >
          <TextField
            type="email"
            autoComplete="email"
            placeholder="e.g. grace@adicon.com"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            disabled={submitting}
            required
          />
        </FormField>

        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          disabled={submitting}
        >
          {submitting ? "Sending…" : "Send reset link"}
        </Button>
      </Stack>
    </form>
  );
}
