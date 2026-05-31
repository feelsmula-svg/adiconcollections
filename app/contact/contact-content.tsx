"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  Container,
  FormField,
  Heading,
  Icon,
  Row,
  Section,
  Stack,
  Text,
  TextField,
  TextLink,
  Textarea,
} from "@/app/components/ui";

interface ContactCard {
  icon: string;
  title: string;
  body: string;
}

const CONTACT_CARDS: ContactCard[] = [
  {
    icon: "mail",
    title: "Email",
    body: "adiconluxuryhair@yahoo.com",
  },
  {
    icon: "call",
    title: "Phone",
    body: "+1 (470) 358-0008",
  },
  {
    icon: "schedule",
    title: "Hours",
    body: "Mon–Fri, 9am–6pm ET",
  },
];

export function ContactContent() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = async () => {
    if (submitting) return;
    setErrorMessage(null);
    if (
      !name.trim() ||
      !email.trim() ||
      !subject.trim() ||
      !body.trim()
    ) {
      setErrorMessage("Please fill in every field.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/contact/messages", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ name, email, subject, body }),
      });
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!response.ok) {
        setErrorMessage(
          data?.error ?? "Could not send your message. Please try again.",
        );
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
      setName("");
      setEmail("");
      setSubject("");
      setBody("");
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container width="default">
      <Section padding="md">
        <Stack gap="xl" className="w-full">
          <Box className="w-full">
            <Row gap="sm" align="center" wrap className="mb-md">
              <TextLink
                href="/"
                variant="muted"
                className="text-label-caps font-label-caps uppercase"
              >
                Home
              </TextLink>
              <Icon
                name="chevron_right"
                className="text-sm text-outline-variant"
              />
              <Text variant="label-caps" tone="primary">
                Contact
              </Text>
            </Row>
            <Box className="max-w-[42rem]">
              <Heading
                level={1}
                variant="display-xl"
                size="headline-md"
                className="leading-tight mb-sm"
              >
                Get in touch
              </Heading>
              <Text variant="body-md" tone="muted">
                Questions about a piece, styling, or your order? Send us a note
                and our concierge team will reply within one business day.
              </Text>
            </Box>
          </Box>

          <Box className="w-full grid grid-cols-1 lg:grid-cols-12 gap-xl items-start">
            <Box className="lg:col-span-7">
              <Card variant="elevated" padding="lg">
                {submitted ? (
                  <Stack
                    gap="md"
                    align="center"
                    justify="center"
                    className="py-2xl text-center"
                  >
                    <Icon
                      name="mark_email_read"
                      className="text-5xl text-primary"
                    />
                    <Heading
                      level={2}
                      variant="headline-sm"
                      size="body-lg"
                      className="font-bold"
                    >
                      Thanks — your message is on its way
                    </Heading>
                    <Text variant="body-sm" tone="muted">
                      Our concierge team will be in touch shortly.
                    </Text>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSubmitted(false)}
                    >
                      Send another message
                    </Button>
                  </Stack>
                ) : (
                  <Stack gap="md">
                    <Heading
                      level={2}
                      variant="headline-sm"
                      size="body-md"
                      tone="primary"
                      className="font-bold"
                    >
                      Send a message
                    </Heading>
                    <Row gap="md" wrap>
                      <FormField
                        label="Name"
                        required
                        className="flex-1 min-w-[180px]"
                      >
                        <TextField
                          autoComplete="name"
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          disabled={submitting}
                        />
                      </FormField>
                      <FormField
                        label="Email"
                        required
                        className="flex-1 min-w-[180px]"
                      >
                        <TextField
                          type="email"
                          autoComplete="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          disabled={submitting}
                        />
                      </FormField>
                    </Row>
                    <FormField label="Subject" required>
                      <TextField
                        placeholder="How can we help?"
                        value={subject}
                        onChange={(event) => setSubject(event.target.value)}
                        disabled={submitting}
                      />
                    </FormField>
                    <FormField label="Message" required>
                      <Textarea
                        rows={5}
                        placeholder="Tell us a bit more…"
                        value={body}
                        onChange={(event) => setBody(event.target.value)}
                        disabled={submitting}
                      />
                    </FormField>
                    {errorMessage ? (
                      <Text variant="body-sm" tone="error">
                        {errorMessage}
                      </Text>
                    ) : null}
                    <Button
                      variant="primary"
                      size="md"
                      fullWidth
                      onClick={onSubmit}
                      loading={submitting}
                      className="tracking-[0.12em]"
                    >
                      {submitting ? "Sending…" : "Send message"}
                    </Button>
                  </Stack>
                )}
              </Card>
            </Box>

            <Box className="lg:col-span-5">
              <Stack gap="md">
                {CONTACT_CARDS.map((card) => (
                  <Card key={card.title} variant="tonal" padding="md">
                    <Row gap="md" align="start">
                      <Icon
                        name={card.icon}
                        className="text-xl text-primary shrink-0"
                      />
                      <Stack gap="xs">
                        <Text
                          variant="label-caps"
                          tone="muted"
                          className="text-[10px]"
                        >
                          {card.title}
                        </Text>
                        <Text variant="body-md" className="font-bold">
                          {card.body}
                        </Text>
                      </Stack>
                    </Row>
                  </Card>
                ))}
                <Card
                  variant="filled"
                  padding="md"
                  className="border-l-4 border-primary"
                >
                  <Stack gap="xs">
                    <Text variant="editorial-italic" tone="primary">
                      &ldquo;Every order is hand-finished and inspected before
                      it leaves our atelier.&rdquo;
                    </Text>
                    <Text
                      variant="label-caps"
                      tone="muted"
                      className="text-[10px]"
                    >
                      — AdiCon concierge
                    </Text>
                  </Stack>
                </Card>
              </Stack>
            </Box>
          </Box>
        </Stack>
      </Section>
    </Container>
  );
}
