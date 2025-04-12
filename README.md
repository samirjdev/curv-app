# Curv

> Stay ahead of the Curv.

Curv is a modern, personalized news dashboard that delivers curated headlines across your favorite topics. With a clean, minimalist interface and topic-based organization, Curv helps you stay informed without the noise.

## Features

- 🎯 **Personalized Topics**: Choose your interests and get headlines tailored to you
- 📱 **Responsive Design**: Beautiful interface that works on any device
- 🌓 **Dark Mode**: Easy on the eyes, day or night
- 📅 **7-Day History**: Access headlines from the past week
- 🔍 **Expandable Headlines**: Click to reveal detailed content and sources
- 🎨 **Modern UI**: Built with shadcn/ui components for a sleek experience

## Tech Stack

- **Frontend**: Next.js 13+ with App Router
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Python for data generation
- **Data Storage**: Static JSON files

## Getting Started

### Prerequisites

- Node.js 16+
- Python 3.8+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/curv.git
cd curv
```

2. Install frontend dependencies:
```bash
npm install
# or
yarn install
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Generate initial data:
```bash
python scripts/generate_data.py
```

5. Start the development server:
```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Project Structure

```
curv/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   └── lib/             # Utility functions
├── public/
│   └── data/            # Generated news data
├── scripts/
│   └── generate_data.py # Data generation script
└── README.md
```

## Usage

1. **First Visit**: Set up your username and select your topics of interest
2. **Dashboard**: View your personalized news feed
3. **Navigation**: 
   - Use top bar arrows to navigate between dates
   - Use bottom bar icons to switch between topics
   - Click headlines to expand/collapse content
4. **Customize**: Click the edit button to modify your topic selection

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
