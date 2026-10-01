import { useEffect, useState } from 'react';
import { CalendarDays, CheckCircle2, MessageSquareText, Sparkles } from 'lucide-react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const START = new Date('2026-10-01T00:00:00+05:30');
const END = new Date('2026-10-10T23:59:59+05:30');
const STORAGE_KEY = 'synknode-feedback-2026-october';

const surveySchema = z.object({
  respondent_name: z.string().trim().min(1, 'Please enter your name').max(100),
  age: z.coerce.number().int().min(13, 'You must be at least 13').max(100),
  gender: z.enum(['woman', 'man', 'non-binary', 'prefer-not-to-say', 'self-describe']),
  gender_detail: z.string().trim().max(80),
  daily_helpfulness: z.enum(['useful', 'very-useful', 'other']),
  daily_helpfulness_detail: z.string().trim().max(300),
  favorite_feature: z.enum(['file-sharing', 'transfer-speed', 'ui-design', 'other']),
  favorite_feature_detail: z.string().trim().max(300),
  wants_upgrade: z.enum(['yes', 'no', 'other']),
  wants_upgrade_detail: z.string().trim().max(300),
  accounts_opinion: z.enum(['helpful', 'very-helpful', 'not-interested', 'incognito']),
  pricing_preference: z.enum(['free', 'pay-as-you-go', 'subscription', 'credits']),
  usage_frequency: z.enum(['daily', 'weekly', 'monthly', 'occasionally']),
  most_wanted_improvement: z.string().trim().min(1, 'Tell us what we should improve').max(500),
  additional_comments: z.string().trim().max(1000),
}).superRefine((data, context) => {
  if (data.gender === 'self-describe' && !data.gender_detail) context.addIssue({ code: 'custom', path: ['gender_detail'], message: 'Please describe your gender' });
  if (data.daily_helpfulness === 'other' && !data.daily_helpfulness_detail) context.addIssue({ code: 'custom', path: ['daily_helpfulness_detail'], message: 'Please tell us how SynkNode helps' });
  if (data.favorite_feature === 'other' && !data.favorite_feature_detail) context.addIssue({ code: 'custom', path: ['favorite_feature_detail'], message: 'Please tell us what you like' });
  if (data.wants_upgrade === 'other' && !data.wants_upgrade_detail) context.addIssue({ code: 'custom', path: ['wants_upgrade_detail'], message: 'Please tell us what you prefer' });
});

type Answers = Record<string, string>;

const initialAnswers: Answers = {
  respondent_name: '', age: '', gender: '', gender_detail: '', daily_helpfulness: '',
  daily_helpfulness_detail: '', favorite_feature: '', favorite_feature_detail: '',
  wants_upgrade: '', wants_upgrade_detail: '', accounts_opinion: '', pricing_preference: '',
  usage_frequency: '', most_wanted_improvement: '', additional_comments: '',
};

type QuestionProps = {
  number: number;
  title: string;
  value: string;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
};

const Question = ({ number, title, value, options, onChange }: QuestionProps) => (
  <fieldset className="space-y-3 border-t border-border pt-5">
    <legend className="mb-3 text-sm font-semibold"><span className="mr-2 text-primary">{number}.</span>{title}</legend>
    <RadioGroup value={value} onValueChange={onChange} className="grid gap-2 sm:grid-cols-2">
      {options.map(([optionValue, label]) => (
        <label key={optionValue} className="flex cursor-pointer items-center gap-3 rounded-md border border-border p-3 text-sm transition-colors hover:border-primary/40 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
          <RadioGroupItem value={optionValue} />{label}
        </label>
      ))}
    </RadioGroup>
  </fieldset>
);

export const SenderFeedbackCampaign = () => {
  const now = new Date();
  const active = now >= START && now <= END;
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(() => localStorage.getItem(STORAGE_KEY) === 'submitted');
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!active || submitted || sessionStorage.getItem(`${STORAGE_KEY}-seen`)) return;
    const timer = window.setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem(`${STORAGE_KEY}-seen`, 'true');
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [active, submitted]);

  if (!active) return null;
  const update = (key: string, value: string) => setAnswers(previous => ({ ...previous, [key]: value }));

  const submit = async () => {
    const parsed = surveySchema.safeParse(answers);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Please complete every question');
      return;
    }
    setSubmitting(true);
    const payload = {
      ...parsed.data,
      gender_detail: parsed.data.gender_detail || null,
      daily_helpfulness_detail: parsed.data.daily_helpfulness_detail || null,
      favorite_feature_detail: parsed.data.favorite_feature_detail || null,
      wants_upgrade_detail: parsed.data.wants_upgrade_detail || null,
      additional_comments: parsed.data.additional_comments || null,
    };
    const { error } = await supabase.from('sender_feedback_responses').insert(payload);
    setSubmitting(false);
    if (error) {
      toast.error('We could not save your feedback. Please try again.');
      return;
    }
    localStorage.setItem(STORAGE_KEY, 'submitted');
    setSubmitted(true);
    setOpen(false);
    toast.success('Thank you — your feedback will shape SynkNode.');
  };

  const question = (number: number, title: string, key: string, options: Array<[string, string]>) => (
    <Question number={number} title={title} value={answers[key]} options={options} onChange={value => update(key, value)} />
  );

  return (
    <>
      <section className="relative overflow-hidden border border-primary/25 bg-primary/5 p-5">
        <div className="absolute right-0 top-0 h-full w-1 bg-primary" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
              {submitted ? <CheckCircle2 className="h-5 w-5" /> : <MessageSquareText className="h-5 w-5" />}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-display text-base font-bold">Help shape SynkNode for everyone</p>
                <span className="rounded-full border border-primary/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">Oct 1–10</span>
              </div>
              <p className="mt-1 max-w-xl text-xs leading-5 text-muted-foreground">{submitted ? 'Your response has been recorded. Thank you.' : 'A short sender survey about accounts, privacy, pricing, and what you want next.'}</p>
            </div>
          </div>
          {!submitted && <Button size="sm" onClick={() => setOpen(true)}><Sparkles className="mr-2 h-4 w-4" />Share feedback</Button>}
        </div>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto rounded-md p-0">
          <DialogHeader className="border-b border-border bg-primary/5 p-6 pr-12 text-left">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-primary"><CalendarDays className="h-4 w-4" />Expansion survey · October 1–10</div>
            <DialogTitle className="font-display text-2xl">Your voice, our next chapter.</DialogTitle>
            <DialogDescription>Tell us how SynkNode should evolve. It takes about three minutes.</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold">Name<Input value={answers.respondent_name} onChange={event => update('respondent_name', event.target.value)} maxLength={100} placeholder="Your name" /></label>
              <label className="space-y-2 text-sm font-semibold">Age<Input value={answers.age} onChange={event => update('age', event.target.value)} type="number" min={13} max={100} placeholder="Age" /></label>
            </div>
            {question(1, 'How do you describe your gender?', 'gender', [['woman','Woman'],['man','Man'],['non-binary','Non-binary'],['prefer-not-to-say','Prefer not to say'],['self-describe','Self-describe']])}
            {answers.gender === 'self-describe' && <Input value={answers.gender_detail} onChange={event => update('gender_detail', event.target.value)} maxLength={80} placeholder="How would you like to describe it?" />}
            {question(2, 'How useful is SynkNode in your daily life?', 'daily_helpfulness', [['useful','Useful'],['very-useful','Very useful'],['other','Something else']])}
            {answers.daily_helpfulness === 'other' && <Input value={answers.daily_helpfulness_detail} onChange={event => update('daily_helpfulness_detail', event.target.value)} maxLength={300} placeholder="Tell us how SynkNode helps you" />}
            {question(3, 'What do you like most about SynkNode?', 'favorite_feature', [['file-sharing','The file-sharing idea'],['transfer-speed','Data transfer speed'],['ui-design','The interface design'],['other','Something else']])}
            {answers.favorite_feature === 'other' && <Input value={answers.favorite_feature_detail} onChange={event => update('favorite_feature_detail', event.target.value)} maxLength={300} placeholder="Tell us what you like" />}
            {question(4, 'Would you like this platform to be upgraded?', 'wants_upgrade', [['yes','Yes'],['no','No'],['other','Something else']])}
            {answers.wants_upgrade === 'other' && <Input value={answers.wants_upgrade_detail} onChange={event => update('wants_upgrade_detail', event.target.value)} maxLength={300} placeholder="Tell us what you prefer" />}
            {question(5, 'Would user accounts make SynkNode more helpful?', 'accounts_opinion', [['helpful','Helpful'],['very-helpful','Very helpful'],['not-interested','I do not like the idea'],['incognito','I want an incognito mode']])}
            {question(6, 'Which pricing approach feels right?', 'pricing_preference', [['free','Free forever'],['pay-as-you-go','Pay as you go'],['subscription','Transfer subscription'],['credits','Credit based']])}
            {question(7, 'How often do you use file-sharing tools?', 'usage_frequency', [['daily','Daily'],['weekly','Weekly'],['monthly','Monthly'],['occasionally','Occasionally']])}
            <label className="block space-y-2 border-t border-border pt-5 text-sm font-semibold"><span><span className="mr-2 text-primary">8.</span>What one improvement would make SynkNode most valuable?</span><Textarea value={answers.most_wanted_improvement} onChange={event => update('most_wanted_improvement', event.target.value)} maxLength={500} placeholder="Tell us what would make the biggest difference" /></label>
            <label className="block space-y-2 text-sm font-semibold">Anything else? <span className="font-normal text-muted-foreground">(optional)</span><Textarea value={answers.additional_comments} onChange={event => update('additional_comments', event.target.value)} maxLength={1000} placeholder="Share any other thoughts" /></label>
            <p className="text-xs leading-5 text-muted-foreground">Your answers are used only to improve SynkNode. Individual responses are not shown publicly.</p>
            <Button className="w-full" size="lg" disabled={submitting} onClick={submit}>{submitting ? 'Sending feedback…' : 'Submit feedback'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};