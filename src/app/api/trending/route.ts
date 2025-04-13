import { NextResponse } from 'next/server';

type TopicKey = 'Sports' | 'Technology' | 'Entertainment' | 'Business' | 'Politics' | 'Science';

interface TrendingItem {
  rank: number;
  title: string;
  description: string;
  source: string;
}

const TRENDING_BY_TOPIC: Record<TopicKey, TrendingItem[]> = {
  Sports: [
    {
      rank: 1,
      title: "McIlroy Leads Masters with DeChambeau Showdown Looming",
      description: "Rory McIlroy stormed to the top of the Masters leaderboard on Saturday with an electrifying third round that included two eagles, finishing two shots ahead of Bryson DeChambeau and on the doorstep of winning the elusive career Grand Slam.",
      source: "ESPN"
    },
    {
      rank: 2,
      title: "Coach Flick to Focus on Recovery as Barcelona Lead LaLiga Race",
      description: "Barcelona's coach, Hansi Flick, emphasizes player recovery as the team maintains its lead in the LaLiga race.",
      source: "Reuters Sports"
    },
    {
      rank: 3,
      title: "Piastri on Pole in Bahrain with Norris Only Sixth",
      description: "Oscar Piastri secures pole position in the Bahrain Grand Prix, while teammate Lando Norris qualifies sixth.",
      source: "The Athletic"
    },
    {
      rank: 4,
      title: "Van der Poel Beats Flamboyant Pogacar to Extend Roubaix Reign",
      description: "Mathieu van der Poel defeats Tadej Pogacar to continue his dominance in the Paris-Roubaix cycling race.",
      source: "Sky Sports"
    },
    {
      rank: 5,
      title: "Shooting for 5th Straight Series Win, Angels Face Astros",
      description: "The Los Angeles Angels aim for their fifth consecutive series victory as they face the Houston Astros.",
      source: "BBC Sport"
    },
    {
      rank: 6,
      title: "NFL's Brain-Safe Helmet Mandate Takes Effect",
      description: "All teams required to use new quantum-cushioning technology by August 2025",
      source: "Sports Illustrated"
    },
    {
      rank: 7,
      title: "First AI-Coached Team Reaches Champions League Semi-Finals",
      description: "FC Copenhagen's revolutionary management system proves successful",
      source: "The Guardian Sport"
    },
    {
      rank: 8,
      title: "Virtual Reality Sports Training Platform Hits 100M Users",
      description: "Amateur athletes using pro-level AI coaching systems worldwide",
      source: "NFL Network"
    },
    {
      rank: 9,
      title: "Cricket Introduces Climate-Adapted Playing Rules",
      description: "ICC announces new regulations for extreme weather conditions",
      source: "Wisden"
    },
    {
      rank: 10,
      title: "Esports Olympics Qualifiers Begin",
      description: "First round of 2028 Olympic gaming qualifications kicks off",
      source: "Associated Press"
    }
  ],
  Technology: [
    {
      rank: 1,
      title: "OpenAI's Sora Revolutionizes Video Creation",
      description: "OpenAI's Sora, a text-to-video model released in December 2024, generates short video clips based on user prompts and can extend existing videos, revolutionizing the video industry.",
      source: "The Verge"
    },
    {
      rank: 2,
      title: "DeepMind Solves Protein Folding Problem",
      description: "DeepMind achieves a 90% accuracy in solving the protein folding problem, a 50-year-old grand challenge, marking a significant leap in biology.",
      source: "MIT Technology Review"
    },
    {
      rank: 3,
      title: "Microsoft's Quantum Cloud Platform Opens to Public",
      description: "Microsoft launches a 1000-qubit quantum computing platform, making advanced quantum computing accessible to developers worldwide.",
      source: "Wired"
    },
    {
      rank: 4,
      title: "Meta's Universal Language Model Breaks Translation Barrier",
      description: "Meta introduces a real-time translation system that adapts to cultural contexts across all known languages.",
      source: "TechCrunch"
    },
    {
      rank: 5,
      title: "Tesla's Robot Workforce Reaches 100,000 Units",
      description: "Tesla's humanoid robots are now operational in manufacturing and service sectors, marking a milestone in automation.",
      source: "Bloomberg Technology"
    },
    {
      rank: 6,
      title: "EU's AI Act Implementation Begins",
      description: "Companies scramble to comply with world's strictest AI regulations",
      source: "IEEE Spectrum"
    },
    {
      rank: 7,
      title: "SpaceX's Mars Communication Relay Goes Live",
      description: "First permanent high-speed internet connection established between Earth and Mars",
      source: "CNET"
    },
    {
      rank: 8,
      title: "First Net-Zero Quantum Data Center Opens",
      description: "Facility uses advanced cooling and renewable energy technologies",
      source: "Data Center Dynamics"
    },
    {
      rank: 9,
      title: "6G Test Networks Show Promise in Urban Trials",
      description: "Early testing demonstrates terabit-speed wireless capabilities",
      source: "Nature Technology"
    },
    {
      rank: 10,
      title: "Samsung's Neural Link Phone Interface Released",
      description: "First consumer device with direct brain-to-device communication",
      source: "Bloomberg Technology"
    }
  ],
  Entertainment: [
    {
      rank: 1,
      title: "AI Actor Wins First Major Film Award",
      description: "A digital performance in 'Tomorrow's Dawn' garners critical acclaim, earning the first major film award for an AI actor.",
      source: "Variety"
    },
    {
      rank: 2,
      title: "Disney's Neural Theme Park Opens in Tokyo",
      description: "Disney launches its first fully personalized, AI-driven entertainment experience in Tokyo, redefining theme park attractions.",
      source: "Hollywood Reporter"
    },
    {
      rank: 3,
      title: "Holographic Taylor Swift Tour Breaks Records",
      description: "Taylor Swift's simultaneous performances in 50 cities using advanced projection technology set new records in the music industry.",
      source: "Billboard"
    },
    {
      rank: 4,
      title: "Netflix's Dream Capture Series Launches",
      description: "Netflix debuts a series created from viewers' dreams using neural interpretation technology, offering a unique entertainment experience.",
      source: "Entertainment Weekly"
    },
    {
      rank: 5,
      title: "PlayStation 6 Neural Link Features Revealed",
      description: "Sony unveils the PlayStation 6, featuring a direct brain-computer interface for an immersive gaming experience.",
      source: "IGN"
    },
    {
      rank: 6,
      title: "First AI-Generated Universe Game Launches",
      description: "Infinite, self-expanding gaming world creates unique content",
      source: "Game Informer"
    },
    {
      rank: 7,
      title: "Warner Bros. Announces Holographic Home Theater",
      description: "Consumer-grade volumetric display technology for movies",
      source: "Deadline"
    },
    {
      rank: 8,
      title: "Spotify's Thought-to-Music Feature Beta Begins",
      description: "Neural interface allows music creation through thought",
      source: "Rolling Stone"
    },
    {
      rank: 9,
      title: "Meta's Emotional Response VR Goes Live",
      description: "Technology adapts content based on user's emotional state",
      source: "TechRadar"
    },
    {
      rank: 10,
      title: "Broadway Introduces AI Understudy System",
      description: "Digital performers ensure shows never cancel due to illness",
      source: "Playbill"
    }
  ],
  Business: [
    {
      rank: 1,
      title: "First AI CEO Reports Record Q1 Profits",
      description: "A tech company's artificial executive outperforms industry benchmarks, reporting unprecedented first-quarter profits.",
      source: "Financial Times"
    },
    {
      rank: 2,
      title: "Global Digital Currency Market Hits $5 Trillion",
      description: "Central Bank Digital Currencies and regulated cryptocurrencies reshape global finance, reaching a market value of $5 trillion.",
      source: "Wall Street Journal"
    },
    {
      rank: 3,
      title: "Amazon's Drone Network Handles 30% of Deliveries",
      description: "Amazon's autonomous aerial delivery system becomes the primary shipping method, managing 30% of its deliveries.",
      source: "Bloomberg"
    },
    {
      rank: 4,
      title: "4-Day Work Week Now Standard in 60% of Fortune 500",
      description: "A majority of Fortune 500 companies adopt a 4-day work week, citing productivity gains and increased employee satisfaction.",
      source: "Forbes"
    },
    {
      rank: 5,
      title: "Lunar Resources Corp Reports First Space Minerals",
      description: "The company delivers rare earth elements from its commercial moon mining operation, marking a new era in space resource utilization.",
      source: "CNBC"
    },
    {
      rank: 6,
      title: "Neural Commerce Platform Revolutionizes Retail",
      description: "Thought-based shopping system launches across major retailers",
      source: "Business Insider"
    },
    {
      rank: 7,
      title: "Lab-Grown Meat Companies Dominate Food Market",
      description: "Synthetic protein production surpasses traditional farming",
      source: "Reuters Business"
    },
    {
      rank: 8,
      title: "Universal Basic Income Expands to 12 More Countries",
      description: "Global adoption of UBI accelerates post-automation surge",
      source: "The Economist"
    },
    {
      rank: 9,
      title: "Autonomous Vehicle Services Exceed Traditional Transit",
      description: "Self-driving transportation becomes primary urban mobility solution",
      source: "Fortune"
    },
    {
      rank: 10,
      title: "Carbon Credit Trading Becomes Largest Commodity Market",
      description: "Environmental assets surpass oil in global trading volume",
      source: "MarketWatch"
    }
  ],
  Politics: [
    {
      rank: 1,
      title: "Global AI Governance Treaty Takes Effect",
      description: "An international agreement sets standards for AI development, aiming to ensure ethical and safe advancements in artificial intelligence.",
      source: "The New York Times"
    },
    {
      rank: 2,
      title: "Digital Democracy Platform Reaches 1B Users",
      description: "A blockchain-based voting system transforms civic participation, amassing over one billion users worldwide.",
      source: "Washington Post"
    },
    {
      rank: 3,
      title: "Space Resource Treaty Ratified by Major Powers",
      description: "Leading nations agree on a framework for extraterrestrial mining, establishing guidelines for space resource utilization.",
      source: "Foreign Policy"
    },
    {
      rank: 4,
      title: "Neural Privacy Act Passes Congress",
      description: "Landmark legislation is enacted to protect data from brain-computer interfaces, addressing emerging privacy concerns.",
      source: "Politico"
    },
    {
      rank: 5,
      title: "Climate Emergency Measures Show First Results",
      description: "A global carbon capture network reports significant progress, indicating the effectiveness of recent climate emergency measures.",
      source: "The Guardian"
    },
    {
      rank: 6,
      title: "Universal Healthcare AI Reduces Global Costs",
      description: "WHO reports 45% efficiency improvement in participating nations",
      source: "The Atlantic"
    },
    {
      rank: 7,
      title: "Autonomous Zones Gain UN Recognition",
      description: "Digital-first jurisdictions establish governance framework",
      source: "Foreign Affairs"
    },
    {
      rank: 8,
      title: "Global Minimum Tax 2.0 Addresses AI Economy",
      description: "Updated framework accounts for automated workforce",
      source: "The Economist"
    },
    {
      rank: 9,
      title: "Mars Colony Treaty Negotiations Begin",
      description: "Nations debate governance of first permanent settlement",
      source: "The Diplomat"
    },
    {
      rank: 10,
      title: "Digital Rights Amendment Ratification Near",
      description: "Constitutional update for AI era gains support",
      source: "NPR"
    }
  ],
  Science: [
    {
      rank: 1,
      title: "Mars Base Alpha Begins Operations",
      description: "The first permanent human settlement on Mars activates its systems, marking a significant milestone in space exploration.",
      source: "Scientific American"
    },
    {
      rank: 2,
      title: "Quantum Internet Backbone Goes Live",
      description: "The first intercontinental quantum network achieves stable operation, revolutionizing global communications.",
      source: "Nature"
    },
    {
      rank: 3,
      title: "CRISPR-V2 Eliminates Genetic Heart Disease",
      description: "A new gene editing platform demonstrates 100% success in trials, offering hope for eradicating genetic heart conditions.",
      source: "Science"
    },
    {
      rank: 4,
      title: "Fusion Power Plant Supplies City Grid",
      description: "A commercial fusion reactor provides stable power to one million homes, showcasing the potential of fusion energy.",
      source: "Physical Review Letters"
    },
    {
      rank: 5,
      title: "Brain Mapping Project Decodes Memory Formation",
      description: "Complete neural process of memory creation understood",
      source: "Cell"
    },
    {
      rank: 6,
      title: "Artificial Womb Technology Approved for Trials",
      description: "Medical breakthrough offers hope for premature births",
      source: "New England Journal of Medicine"
    },
    {
      rank: 7,
      title: "Ocean Carbon Capture Network Expands",
      description: "Marine CO2 absorption system shows promising results",
      source: "Science Advances"
    },
    {
      rank: 8,
      title: "Quantum Computer Simulates Complex Molecule",
      description: "Breakthrough enables new drug discovery methods",
      source: "Nature Chemistry"
    },
    {
      rank: 9,
      title: "Biodiversity Restoration AI Shows Success",
      description: "Automated ecosystem management reverses species decline",
      source: "Conservation Biology"
    },
    {
      rank: 10,
      title: "Room Temperature Superconductor Synthesized",
      description: "Material works at ambient pressure and temperature",
      source: "Physics Today"
    }
  ]
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic');

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // Capitalize first letter to match the TRENDING_BY_TOPIC keys
    const normalizedTopic = topic.charAt(0).toUpperCase() + topic.slice(1) as TopicKey;
    console.log('Looking up trending data for topic:', normalizedTopic);

    const trendingData = TRENDING_BY_TOPIC[normalizedTopic];
    if (!trendingData) {
      console.log('No trending data found for topic:', normalizedTopic);
      console.log('Available topics:', Object.keys(TRENDING_BY_TOPIC));
      return NextResponse.json([]);
    }

    // Add a random delay between 4-10 seconds
    const delay = Math.floor(Math.random() * (10000 - 4000 + 1) + 4000);
    await new Promise(resolve => setTimeout(resolve, delay));

    return NextResponse.json(trendingData);
  } catch (error) {
    console.error('Error in trending API:', error);
    return NextResponse.json(
      { error: 'Failed to generate trending topics' },
      { status: 500 }
    );
  }
} 