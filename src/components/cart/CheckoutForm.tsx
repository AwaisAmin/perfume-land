"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import type { SiteContent } from "@/lib/types";
import { isValidPhone, type OrderCustomer } from "@/lib/whatsapp-order";

type Field = keyof OrderCustomer;
type CheckoutFormProps = {
  texts: SiteContent["checkout"];
  onBack: () => void;
  onSubmit: (customer: OrderCustomer) => void;
};

const inputClass =
  "w-full rounded-none border bg-transparent px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-ink focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-forest-900";

/**
 * The short "your details" step between the cart and WhatsApp. Validates on
 * submit, moves focus to the first invalid field and ties each error to its
 * input (aria-invalid + aria-describedby).
 */
export default function CheckoutForm({ texts, onBack, onSubmit }: CheckoutFormProps) {
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<OrderCustomer>({ name: "", phone: "", city: "", address: "", note: "" });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});

  const validate = (v: OrderCustomer) => {
    const next: Partial<Record<Field, string>> = {};
    if (!v.name.trim()) next.name = texts.requiredError;
    if (!v.phone.trim()) next.phone = texts.requiredError;
    else if (!isValidPhone(v.phone)) next.phone = texts.phoneError;
    if (!v.city.trim()) next.city = texts.requiredError;
    if (!v.address.trim()) next.address = texts.requiredError;
    return next;
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next = validate(values);
    setErrors(next);
    const firstInvalid = (["name", "phone", "city", "address"] as const).find((f) => next[f]);
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`#${CSS.escape(`${id}-${firstInvalid}`)}`)?.focus();
      return;
    }
    onSubmit(values);
  };

  const field = (name: Field, label: string, opts: { required: boolean; type?: string; autoComplete?: string; multiline?: boolean; maxLength: number }) => {
    const inputId = `${id}-${name}`;
    const errorId = `${inputId}-error`;
    const error = errors[name];
    const common = {
      id: inputId,
      name,
      value: values[name],
      maxLength: opts.maxLength,
      required: opts.required,
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? errorId : undefined,
      className: `${inputClass} ${error ? "border-red-700" : "border-ink/15"}`,
      onChange: (e: { target: { value: string } }) => setValues((v) => ({ ...v, [name]: e.target.value })),
    };
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm text-ink">
          {label}
          {opts.required ? (
            <span aria-hidden="true" className="text-red-700"> *</span>
          ) : (
            <span className="text-ink/50"> {texts.optionalHint}</span>
          )}
        </label>
        {opts.multiline ? (
          <textarea {...common} rows={3} className={`${common.className} resize-y`} />
        ) : (
          <input {...common} type={opts.type ?? "text"} autoComplete={opts.autoComplete} />
        )}
        {error && (
          <p id={errorId} className="text-xs text-red-700">
            {error}
          </p>
        )}
      </div>
    );
  };

  return (
    <form ref={formRef} noValidate onSubmit={submit} className="flex flex-col gap-4 py-5">
      <div>
        <h3 className="text-base font-semibold text-ink">{texts.heading}</h3>
        <p className="mt-1 text-[13px] text-ink/60">{texts.intro}</p>
      </div>
      {field("name", texts.nameLabel, { required: true, autoComplete: "name", maxLength: 100 })}
      {field("phone", texts.phoneLabel, { required: true, type: "tel", autoComplete: "tel", maxLength: 30 })}
      {field("city", texts.cityLabel, { required: true, autoComplete: "address-level2", maxLength: 60 })}
      {field("address", texts.addressLabel, { required: true, autoComplete: "street-address", multiline: true, maxLength: 300 })}
      {field("note", texts.noteLabel, { required: false, multiline: true, maxLength: 500 })}

      <div className="mt-2 flex flex-col gap-3">
        <button
          type="submit"
          className="w-full cursor-pointer bg-forest-900 px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-cream-50 transition-colors hover:bg-forest-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-900"
        >
          {texts.submit}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="cursor-pointer self-center py-2 text-xs text-ink/60 underline hover:text-ink"
        >
          {texts.back}
        </button>
      </div>
    </form>
  );
}
