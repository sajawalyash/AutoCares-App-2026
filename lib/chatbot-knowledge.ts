export type KnowledgeItem = {
  intent: string
  question: string
  answer: string
}

export const CHATBOT_KNOWLEDGE: KnowledgeItem[] = [
  {
    intent: 'engine_stop',
    question: 'Why did my bike engine suddenly stop while riding?',
    answer: 'Check fuel level, battery connection, and spark plug. Restart after cooling.',
  },
  {
    intent: 'bike_not_starting',
    question: 'My bike is not starting. What should I check first?',
    answer: 'Ensure fuel is available, ignition is ON, and battery connections are secure.',
  },
  {
    intent: 'tire_puncture',
    question: 'My bike tire is punctured. What should I do?',
    answer: 'Stop safely and request puncture repair through the Autocares app.',
  },
  {
    intent: 'engine_overheating',
    question: 'Why is my bike engine overheating?',
    answer: 'Allow engine to cool and check engine oil level.',
  },
  {
    intent: 'dead_battery',
    question: 'My car battery is dead. How can I start my car?',
    answer: 'Try jump-starting the battery or request battery assistance.',
  },
  {
    intent: 'engine_noise',
    question: 'My scooter is making unusual engine noise.',
    answer: 'Check engine oil and inspect engine components.',
  },
  {
    intent: 'electrical_issue',
    question: 'My bike lights are not working.',
    answer: 'Inspect battery, fuse, and wiring connections.',
  },
  {
    intent: 'low_tire_pressure',
    question: 'My car tire pressure is low. Can I drive?',
    answer: 'Drive slowly to a service station or inflate the tire.',
  },
  {
    intent: 'smoke_issue',
    question: 'Why does my bike produce white smoke?',
    answer: 'White smoke may indicate oil burning or engine leakage.',
  },
  {
    intent: 'battery_drain',
    question: 'My scooter battery keeps draining quickly.',
    answer: 'Battery may be weak or wiring faulty; inspection is recommended.',
  },
  {
    intent: 'accelerator_issue',
    question: 'My car engine does not respond when I press the accelerator.',
    answer: 'Fuel supply or throttle issues may be the cause.',
  },
  {
    intent: 'vibration_issue',
    question: 'Why is my bike vibrating excessively?',
    answer: 'Loose engine parts or tire imbalance may cause vibration.',
  },
  {
    intent: 'car_overheating',
    question: 'My car is overheating in traffic.',
    answer: 'Stop vehicle and allow engine to cool down.',
  },
  {
    intent: 'self_start_issue',
    question: 'My scooter self-start is not working.',
    answer: 'Battery or starter motor may need inspection.',
  },
  {
    intent: 'starter_issue',
    question: 'My car makes a clicking sound when starting.',
    answer: 'Weak battery or starter motor issue.',
  },
  {
    intent: 'chain_problem',
    question: 'My bike chain is making noise.',
    answer: 'Chain may require lubrication or tightening.',
  },
  {
    intent: 'brake_issue',
    question: 'My car brakes feel weak.',
    answer: 'Brake pads or brake fluid may need replacement.',
  },
  {
    intent: 'speed_drop',
    question: 'My bike speed suddenly dropped.',
    answer: 'Fuel blockage or engine malfunction may occur.',
  },
  {
    intent: 'water_damage',
    question: 'My scooter stopped after heavy rain.',
    answer: 'Water may have entered engine or electrical system.',
  },
  {
    intent: 'engine_idle_issue',
    question: 'My car engine shakes while idling.',
    answer: 'Dirty injectors or engine misfire may occur.',
  },
  {
    intent: 'burning_smell',
    question: 'My bike smells like burning.',
    answer: 'Overheated components or oil leakage may cause burning smell.',
  },
  {
    intent: 'ac_issue',
    question: 'My car AC stopped working.',
    answer: 'AC refrigerant leakage or compressor problem.',
  },
  {
    intent: 'slow_start',
    question: 'My scooter takes too long to start.',
    answer: 'Battery weakness or fuel blockage may cause delay.',
  },
  {
    intent: 'brake_noise',
    question: 'My bike brakes make noise.',
    answer: 'Worn brake pads may cause noise.',
  },
  {
    intent: 'steering_issue',
    question: 'My car steering feels heavy.',
    answer: 'Low power steering fluid may be the issue.',
  },
  {
    intent: 'engine_stall',
    question: 'My bike stalls at traffic signals.',
    answer: 'Incorrect idle speed or carburetor problem.',
  },
  {
    intent: 'black_smoke',
    question: 'My scooter produces black smoke.',
    answer: 'Air filter blockage may cause black smoke.',
  },
  {
    intent: 'high_fuel_consumption',
    question: 'My car fuel consumption increased suddenly.',
    answer: 'Dirty air filters or poor tuning may increase fuel use.',
  },
  {
    intent: 'dim_headlight',
    question: 'My bike headlight becomes dim.',
    answer: 'Weak battery or alternator issue.',
  },
  {
    intent: 'brake_sound',
    question: 'My car makes noise when braking.',
    answer: 'Brake pads or discs may require inspection.',
  },
]
