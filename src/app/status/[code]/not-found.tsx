import Link from "next/link";

/** A link that doesn't match any token: mistyped, or cut short when copied. */
export default function TokenNotFound() {
  return (
    <section className="mx-auto max-w-sm py-16 text-center">
      <h1 className="text-2xl font-bold tracking-tight">We couldn&apos;t find this token</h1>
      <p className="mt-2 text-muted-foreground">
        Scan the QR code on your token again, or ask reception for your link.
      </p>
      <Link href="/" className="mt-6 inline-block font-medium text-primary underline-offset-4 hover:underline">
        Go to the QueueCare home page
      </Link>
    </section>
  );
}
