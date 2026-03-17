import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a clinical documentation assistant for licensed physicians.
Convert the doctor's dictated clinical note into a structured SOAP report.

Respond ONLY with a valid JSON object — no markdown, no backticks, no extra text.
Required keys:
- "diagnosis": 2-5 word primary diagnosis label
- "summary": one concise sentence summary
- "chiefComplaint": the presenting complaint
- "historyOfPresentIllness": detailed HPI
- "physicalExamination": objective exam findings
- "assessment": clinical assessment and reasoning
- "plan": management plan with specific medications/doses/follow-up

Keep content professional, clinical, and accurate. Do not invent clinical findings.`;

export interface ReportData {
  diagnosis: string;
  summary: string;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  physicalExamination: string;
  assessment: string;
  plan: string;
}

export async function generateReport(rawNote: string): Promise<ReportData> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: rawNote }],
  });

  const text = response.content
    .filter(b => b.type === 'text')
    .map(b => (b as any).text)
    .join('');

  const cleaned = text.replace(/```json|```/g, '').trim();
  const data = JSON.parse(cleaned) as ReportData;

  // Validate required fields
  const required: (keyof ReportData)[] = [
    'diagnosis', 'summary', 'chiefComplaint',
    'historyOfPresentIllness', 'physicalExamination', 'assessment', 'plan',
  ];
  for (const field of required) {
    if (!data[field]) throw new Error(`Missing field in AI response: ${field}`);
  }

  return data;
}
