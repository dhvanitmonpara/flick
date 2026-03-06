import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function FAQs() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {FAQsData.map(({ question, answer }) => (
        <AccordionItem key={question} className="border-none bg-transparent" value={question}>
          <AccordionTrigger className="text-base font-semibold cursor-pointer text-zinc-900">{question}</AccordionTrigger>
          <AccordionContent className="text-zinc-600 text-base">
            {answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

const FAQsData = [
  {
    question: "What is Flick?",
    answer: "Flick is a platform that helps you [do something awesome]. Whether you're [user type], Flick makes it easy to [main value prop]."
  },
  {
    question: "Is Flick free to use?",
    answer: "Yes, Flick offers a free tier with essential features. Premium plans are available for power users who want more control and advanced features."
  },
  {
    question: "Which platforms does Flick support?",
    answer: "Flick is available on iOS, Android, and web browsers. You can access it anywhere, anytime."
  },
  {
    question: "How do I reset my password?",
    answer: "Click on 'Forgot Password' on the login screen, and follow the instructions sent to your registered email address."
  },
  {
    question: "How do I contact support?",
    answer: "You can reach out via our in-app chat or email us at support@flickapp.com. We're quick — unless it's Sunday and we're hungover."
  },
  {
    question: "Can I delete my account?",
    answer: "Yes, go to Settings > Account > Delete Account. We’ll miss you (and your data will be nuked)."
  },
];