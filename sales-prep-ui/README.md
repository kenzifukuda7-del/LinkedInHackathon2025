# LinkedIn Sales Prep UI

A responsive web application for LinkedIn sales representatives to prepare for outbound prospecting calls and renewal check-ins with existing customers.

## Features

### Landing Page
- **LinkedIn-inspired Design**: Clean, professional blue/white theme matching LinkedIn's branding
- **Hero Section**: Large headline "LinkedIn Research Made Simple" with compelling subtext
- **Feature Cards**: Three key features highlighting comprehensive research, key stakeholders, and AI-powered emails
- **Clear CTA**: "Start Research" button to begin the workflow
- **Trusted By Section**: Footer showcasing LinkedIn's four main solution areas

### Workflow Screen
- **Company Inputs**: Company name and website fields
- **Product Selection**: Dropdown to select LinkedIn product focus (LTS, LLS, LMS, LSS)
- **Dynamic Value Props**: Auto-display of product-specific value propositions
- **Research Options**: Comprehensive checkbox options including:
  - Company history
  - Existing product offerings
  - Financial information
  - News articles
  - Industry deep dive
  - Competitors and trends
  - Key stakeholders/contacts
  - Draft outbound email
  - Contract details (existing customers)
  - Prior correspondence summary (existing customers)

### Results Display
- **Expandable Cards**: Clean, organized display of research results
- **Rich Data Formatting**: Properly formatted company data, financials, news articles, and stakeholder information
- **Interactive Elements**: Click to expand/collapse different research sections
- **Professional Layout**: Easy-to-scan information for sales calls

## Technology Stack

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful, customizable icons
- **Responsive Design**: Mobile-first approach with desktop optimization

## Getting Started

### Prerequisites
- Node.js 18+ (recommended)
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd sales-prep-ui
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── research/
│   │       └── route.ts          # API endpoint for research generation
│   ├── globals.css               # Global styles
│   ├── layout.tsx               # Root layout component
│   └── page.tsx                 # Main page component
├── components/
│   ├── HeroSection.tsx           # Landing page hero section
│   └── WorkflowScreen.tsx       # Main workflow interface
```

## API Integration

The application includes a mock API endpoint (`/api/research`) that simulates integration with the existing `companyintel` Python backend. In a production environment, this would be replaced with actual API calls to the Python service.

### API Endpoint: `/api/research`

**Method**: POST

**Request Body**:
```json
{
  "companyName": "string",
  "companyWebsite": "string",
  "selectedProduct": "LTS|LLS|LMS|LSS",
  "researchOptions": {
    "companyHistory": boolean,
    "existingProducts": boolean,
    "financialInfo": boolean,
    "newsArticles": boolean,
    "industryDeepDive": boolean,
    "competitorsTrends": boolean,
    "keyStakeholders": boolean,
    "draftEmail": boolean,
    "contractDetails": boolean,
    "priorCorrespondence": boolean
  }
}
```

**Response**:
```json
{
  "companyName": "string",
  "companyWebsite": "string",
  "selectedProduct": "string",
  "results": {
    "companyHistory": { ... },
    "existingProducts": { ... },
    "financialInfo": { ... },
    // ... other research results
  }
}
```

## Future Enhancements (V2)

- **Customer Status Flags**: Visual indicators for existing vs churned LinkedIn customers
- **Integration Placeholders**: Ready for Sales Navigator, Gong, and CRM data integration
- **Usage Analytics**: Track user interactions and success metrics
- **Feedback System**: Collect user feedback for continuous improvement

## Design System

### Colors
- **Primary Blue**: `#2563eb` (LinkedIn-inspired)
- **Secondary Blue**: `#1d4ed8`
- **Background**: `#f8fafc` to `#dbeafe` (gradient)
- **Text**: `#1f2937` (dark gray)
- **Accent**: `#6b7280` (medium gray)

### Typography
- **Headings**: Bold, large font sizes (text-5xl to text-7xl)
- **Body**: Medium weight, readable sizes
- **UI Elements**: Consistent font weights and sizes

### Components
- **Cards**: White background, rounded corners, subtle shadows
- **Buttons**: Blue primary, rounded corners, hover states
- **Inputs**: Clean borders, focus states, proper spacing
- **Icons**: Consistent sizing and styling from Lucide React

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the LinkedIn GTM R&D Hackathon 2025.