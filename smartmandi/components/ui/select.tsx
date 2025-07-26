// components/ui/select.tsx  (tiny wrapper if not already provided)
"use client";
import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cn } from "@/lib/utils";

export function Select({
  label,
  children,
  ...props
}: SelectPrimitive.SelectProps & { label?: string }) {
  return (
    <SelectPrimitive.Root {...props}>
      {label && <label className="mb-1 block text-sm">{label}</label>}
      <SelectPrimitive.Trigger className="inline-flex h-10 w-full items-center justify-between rounded-md border bg-white px-3 text-sm">
        <SelectPrimitive.Value />
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Content className="rounded-md border bg-white shadow-lg">
        <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Root>
  );
}

export const SelectItem = React.forwardRef<
  HTMLDivElement,
  SelectPrimitive.SelectItemProps
>(({ children, className, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    {...props}
    className={cn(
      "relative flex cursor-pointer select-none items-center px-6 py-2 text-sm outline-none data-[highlighted]:bg-gray-100",
      className
    )}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = "SelectItem";
