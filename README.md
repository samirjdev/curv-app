# <img src="/public/curv_text.png" alt="Curv Logo" width="800" />

# Curv - The Mindful "Anti-Social Media" Platform

Built in under 24 hours for HackaBull 2025 at the University of South Florida! 🚀

## Inspiration

In today's digital age, social media platforms often lead to negative effects like depression, anxiety, and cyberbullying. We wanted to create a platform that captures the engaging aspects of social media while eliminating its harmful elements. Curv is designed to keep you informed by keeping you ahead of the Curv and connected without the downsides of traditional social media.

### The Problem We're Solving
- 🕒 People spend excessive time on social media
- 😔 Social media contributes to depression and anxiety
- 🎯 Cyberbullying and toxic behavior online
- 📱 Addictive design patterns in current platforms

### Our Solution
Curv provides a mindful approach to news consumption and community interaction:
- Clean, distraction-free interface
- Focus on quality content over engagement metrics
- Community-driven discussions without the toxicity
- AI-powered content curation for balanced perspectives

## Technologies Used

### Frontend
- **Next.js 14** - React framework with App Router
- **shadcn/ui** - High-quality UI components
- **TailwindCSS** - Utility-first CSS framework
- **PlotDB** - For SVG Theming
- **TypeScript** - Type-safe development

### Backend
- **Python FastAPI** - High-performance API server
- **MongoDB Atlas** - Cloud database for:
  - User profiles and authentication
  - Article storage and management
  - Comment systems
  - Rating and interaction tracking
  - Content recommendations

### AI/ML
- **Google Gemini** - Powering:
  - Article generation from news sources
  - Content summarization
  - Comment analysis
  - Topic classification

### Security
- **bcrypt** - Secure password hashing
- **JWT** - Token-based authentication
- **HTTP-only cookies** - Secure session management

## Features

### Authentication System
- Complete user authentication flow
- Secure password hashing with bcrypt
- JWT token management
- Protected API routes

### MongoDB Integration
- Efficient document-based data storage
- Real-time data updates
- Complex aggregation pipelines for:
  - Content recommendations
  - User interaction tracking
  - Comment threading
  - Rating systems

### AI-Powered Content
- Automated article generation from trusted sources
- Smart content summarization
- Topic-based article classification
- Sentiment analysis for community health

### Modern UI/UX
- Responsive design
- Dark/light mode
- Animated backgrounds using PlotDB
- Smooth transitions and interactions

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/samirjdev/curvapp.git
cd curv
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Add your API keys and configuration
```

4. Start the development server:
```bash
npm run dev
```

5. For the Python backend:
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## Environment Variables

Required environment variables:
```
MONGODB_URI=your_mongodb_uri
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret
```

## License

MIT License - see LICENSE.md for details
