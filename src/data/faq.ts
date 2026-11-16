import { display, site } from "../config/site";

export const faqTopics = [
  { id: "ordering", label: "Ordering" },
  { id: "samples", label: "Samples" },
  { id: "shipping-payment", label: "Shipping & Payment" },
  { id: "customization", label: "Customization" },
  { id: "quality-safety", label: "Quality & Safety" },
] as const;

interface FaqItem {
  topic: (typeof faqTopics)[number]["label"];
  question: string;
  answer: string;
  featured?: boolean;
}

export const faqs: readonly FaqItem[] = [
  {
    topic: "Ordering",
    question: "What should I include in a quote request?",
    answer:
      "We need your cup style, dimensions, delivery destination, and any print or packaging requirements. Share an estimated quantity if you have one, or we can discuss it with you.",
    featured: true,
  },
  {
    topic: "Ordering",
    question: "What is your minimum order quantity?",
    answer: `We quote stock and custom orders separately. Stock MOQ: ${display(site.stockMoq, "stock MOQ")}. Custom MOQ: ${display(site.customMoq, "custom MOQ")}.`,
  },
  {
    topic: "Ordering",
    question: "How do I request a quote for several products?",
    answer:
      'We can review several products together. Click "+ Add to inquiry" on each product card, then open Inquiry. Enter quantities if known, or leave them blank for discussion, and choose "Continue to Quote Form". Your selected products will appear together on the contact page. Form submission will be available in the next stage.',
  },
  {
    topic: "Samples",
    question: "Can I request a sample before placing a bulk order?",
    answer:
      "Yes. Tell us the cup style and your shipping destination. We'll confirm sample availability and delivery details.",
    featured: true,
  },
  {
    topic: "Samples",
    question: "How long does sampling take, and what does it cost?",
    answer: `We confirm sample timing and costs for your request. Sample lead time: ${display(site.sampleLeadTime, "sample lead time")}. Sample policy: ${display(site.sampleCost, "sample cost and policy")}.`,
  },
  {
    topic: "Shipping & Payment",
    question: "What is the production lead time?",
    answer: `We confirm the production schedule with your order specifications. Production lead time: ${display(site.productionLeadTime, "production lead time")}.`,
  },
  {
    topic: "Shipping & Payment",
    question: "Which shipping methods do you offer?",
    answer: `We review delivery options for your destination. Shipping methods: ${display(site.shippingMethods, "shipping methods")}.`,
  },
  {
    topic: "Shipping & Payment",
    question: "What are your payment terms?",
    answer: `We confirm payment arrangements in your quotation. Payment terms: ${display(site.paymentTerms, "payment terms")}.`,
  },
  {
    topic: "Customization",
    question: "Can I use my own artwork?",
    answer:
      "Yes. Send us your artwork, cup style and size, and we'll check the fit and send a mockup.",
    featured: true,
  },
  {
    topic: "Customization",
    question: "Can you customize sizes, colors and packaging?",
    answer:
      "Yes. We customize logos, sizes, colors, patterns and packaging. Share your requirements so we can check the details together.",
  },
  {
    topic: "Customization",
    question: "Can I choose from existing prints?",
    answer:
      "Yes. We offer a broad range of patterns, solid colors and seasonal designs. Tell us your preferred style so we can discuss suitable options.",
  },
  {
    topic: "Quality & Safety",
    question: "How can I check food-contact requirements?",
    answer:
      "We use food-grade, grease-resistant paper. Tell us your market and intended use, and we'll share the relevant material documents.",
    featured: true,
  },
  {
    topic: "Quality & Safety",
    question: "Can I review your certificates?",
    answer: `We can discuss documentation for your market. Certificate information: ${site.certificates.length ? site.certificates.map(({ name }) => display(name, "certificate name")).join(", ") : "[TODO: certificates]"}.`,
  },
];
