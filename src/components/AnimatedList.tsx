"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";

/**
 * A list whose rows glide to their new place when the order changes (for example when a
 * patient becomes Emergency and moves to the top), fade in when they arrive and out when
 * they leave. The rows themselves are rendered on the server and passed in as children.
 *
 * `reducedMotion="user"` turns the movement off for anyone whose device asks for less motion.
 * `initial={false}` means rows already on the page when it first loads don't animate in.
 */
export function AnimatedList({ children, ...props }: React.ComponentProps<"ol">) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}>
      <ol {...props}>
        <AnimatePresence initial={false}>{children}</AnimatePresence>
      </ol>
    </MotionConfig>
  );
}

/** One row. Give it a stable `key` (the visit id) so a row keeps its identity when it moves. */
export function AnimatedItem(props: React.ComponentProps<typeof motion.li>) {
  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 24 }}
      {...props}
    />
  );
}
