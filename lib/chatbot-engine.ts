import { CHATBOT_KNOWLEDGE, type KnowledgeItem } from '@/lib/chatbot-knowledge'

type IntentRule = {
  intent: string
  keywords: string[]
  response: string
}

const INTENT_RULES: IntentRule[] = [
  {
    intent: 'bike_not_starting',
    keywords: ['not starting', 'wont start', "won't start", 'self start', 'starter'],
    response:
      'If your vehicle is not starting, check fuel level, ignition switch, and battery terminals first. If there is only a clicking sound, battery or starter motor is likely weak.',
  },
  {
    intent: 'engine_overheating',
    keywords: ['overheat', 'overheating', 'high temp', 'engine temp'],
    response:
      'If overheating, stop safely and switch off the engine. Let it cool, check coolant/engine oil level, and avoid driving until temperature returns to normal.',
  },
  {
    intent: 'battery_issue',
    keywords: ['battery', 'dead battery', 'battery drain', 'jump start'],
    response:
      'For battery issues, inspect terminals for corrosion/loose connections. Try jump-start if needed. If battery drains repeatedly, charging system or battery health needs inspection.',
  },
  {
    intent: 'brake_issue',
    keywords: ['brake', 'brakes', 'brake noise', 'brake weak', 'stopping distance'],
    response:
      'Brake issues are safety-critical. Check brake fluid and pad wear immediately, and avoid high-speed driving until brakes are inspected by a mechanic.',
  },
  {
    intent: 'tire_issue',
    keywords: ['puncture', 'flat tire', 'low tire pressure', 'tire pressure'],
    response:
      'For tire issues, park safely and inspect the tire sidewall/tread. Inflate if low pressure; for puncture, avoid riding far and request puncture or roadside assistance.',
  },
  {
    intent: 'smoke_issue',
    keywords: ['white smoke', 'black smoke', 'smoke', 'burning smell'],
    response:
      'Smoke or burning smell can indicate oil leakage, air-fuel problems, or overheating components. Stop safely, switch off engine, and arrange inspection before further driving.',
  },
]

const URGENT_KEYWORDS = [
  'accident',
  'fire',
  'smoke in cabin',
  'brake failed',
  'stuck on road',
  'emergency',
  'help now',
  'stranded',
  'cant move',
  "can't move",
]

export function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function expandNoisyText(input: string): string {
  let text = normalizeText(input)
  const replacements: Record<string, string> = {
    helo: 'hello',
    hii: 'hi',
    engin: 'engine',
    btry: 'battery',
    brk: 'brake',
    ovrheat: 'overheat',
    strt: 'start',
    punctur: 'puncture',
  }

  for (const [from, to] of Object.entries(replacements)) {
    text = text.replace(new RegExp(`\\b${from}\\b`, 'g'), to)
  }

  return text
}

function getTokenSet(input: string): Set<string> {
  return new Set(
    expandNoisyText(input)
      .split(' ')
      .filter((token) => token.length > 2)
  )
}

function tokenOverlapScore(a: string, b: string): number {
  const aSet = getTokenSet(a)
  const bSet = getTokenSet(b)
  if (!aSet.size || !bSet.size) return 0

  let overlap = 0
  for (const token of aSet) {
    if (bSet.has(token)) overlap += 1
  }

  return overlap / Math.max(aSet.size, bSet.size)
}

function getBestKnowledgeMatch(input: string): KnowledgeItem | null {
  let best: { item: KnowledgeItem; score: number } | null = null

  for (const item of CHATBOT_KNOWLEDGE) {
    const score = tokenOverlapScore(input, item.question)
    if (score > 0.22 && (!best || score > best.score)) {
      best = { item, score }
    }
  }

  return best?.item || null
}

function getBestIntentMatch(input: string): IntentRule | null {
  const text = expandNoisyText(input)
  let best: { rule: IntentRule; score: number } | null = null

  for (const rule of INTENT_RULES) {
    const score = rule.keywords.reduce((acc, keyword) => {
      return text.includes(normalizeText(keyword)) ? acc + 1 : acc
    }, 0)

    if (score > 0 && (!best || score > best.score)) {
      best = { rule, score }
    }
  }

  return best?.rule || null
}

export function getLocalAssistantResponse(userMessage: string): string {
  const lowerMessage = expandNoisyText(userMessage)
  const hasIssueSignal = [
    'start',
    'engine',
    'battery',
    'brake',
    'overheat',
    'puncture',
    'smoke',
    'noise',
    'warning',
    'tire',
  ].some((keyword) => lowerMessage.includes(keyword))

  if (
    ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'].some((greeting) =>
      lowerMessage.includes(greeting)
    ) &&
    !hasIssueSignal
  ) {
    return "Hi! I'm your AutoCares assistant. I can help diagnose vehicle issues or guide you to quick help. Tell me your vehicle type (car, bike, or scooter) and what problem you're facing."
  }

  if (lowerMessage.includes('how are you')) {
    return "I'm doing great, thanks for asking. I'm here to help with your vehicle issue. What symptom are you seeing (for example: not starting, overheating, strange noise, battery, or brakes)?"
  }

  if (lowerMessage.includes('thanks') || lowerMessage.includes('thank you')) {
    return "You're welcome! If you want, I can also suggest the next best step or when to request roadside assistance."
  }

  if (URGENT_KEYWORDS.some((term) => lowerMessage.includes(term))) {
    return 'This sounds urgent. Please stop in a safe location, turn on hazard lights, and request Roadside Assistance immediately from your dashboard. If there is danger, contact emergency services first.'
  }

  if (lowerMessage.includes('dtc') || lowerMessage.includes('diagnostic code')) {
    return 'Diagnostic Trouble Codes (DTCs) indicate specific vehicle issues. Visit our Diagnostics section to search our complete database of codes and meanings, then share the exact code for targeted guidance.'
  }

  if (lowerMessage.includes('obd') || lowerMessage.includes('scanner')) {
    return 'An OBD-II scanner reads live vehicle data. Connect your scanner in Vehicle Settings to monitor temperature, fuel, and active fault codes in real time.'
  }

  if (lowerMessage.includes('p0300') || lowerMessage.includes('misfire')) {
    return 'Code P0300 means random misfire. Start by checking spark plugs and ignition coils, then inspect injectors and fuel quality. Avoid hard acceleration until diagnosed.'
  }

  if (lowerMessage.includes('p0128') || lowerMessage.includes('thermostat')) {
    return 'Code P0128 usually points to thermostat/coolant temperature issues. Driving long with this can reduce efficiency and stress the engine. Get cooling system inspection soon.'
  }

  if (lowerMessage.includes('p0171') || lowerMessage.includes('lean')) {
    return 'Code P0171 indicates a lean mixture. Common causes include vacuum leaks, weak fuel delivery, or sensor issues. A diagnostic scan and smoke test are recommended.'
  }

  const knowledgeMatch = getBestKnowledgeMatch(userMessage)
  if (knowledgeMatch) {
    return `${knowledgeMatch.answer} If this does not resolve the issue, share additional symptoms and I will suggest the next diagnostic step.`
  }

  const bestIntent = getBestIntentMatch(userMessage)
  if (bestIntent) {
    return bestIntent.response
  }

  if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
    return 'I can help with troubleshooting, diagnostics, and next steps. Share your vehicle type and one symptom, and I will give you a focused action plan.'
  }

  if (lowerMessage.includes('mechanic') || lowerMessage.includes('professional')) {
    return 'For complex or repeating issues, visit Mechanics to connect with a verified professional. I can help you prepare symptoms and likely causes before your visit.'
  }

  return "I can help better if you share 2 details: your vehicle type (car, bike, scooter) and main symptom (not starting, overheating, puncture, battery, brake, smoke, or warning light). Then I’ll give step-by-step guidance."
}
