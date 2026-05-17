import { BenefitsSection } from './sections/BenefitsSection';
import { DemoSection } from './sections/DemoSection';
import { FaqSection } from './sections/FaqSection';
import { Footer } from './sections/Footer';
import { Header } from './sections/Header';
import { HeroSection } from './sections/HeroSection';
import { HowItWorksSection } from './sections/HowItWorksSection';
import { PricingSection } from './sections/PricingSection';
import { TemplateShowcaseSection } from './sections/TemplateShowcaseSection';
import { TestimonialsSection } from './sections/TestimonialsSection';
import { TopAnnouncement } from './sections/TopAnnouncement';

export function LandingPage() {
    return (
        <div className="scrapbook-background min-h-screen bg-[#F4E8D9] text-[#221C19]">
            <TopAnnouncement />
            <Header />
            <main>
                <HeroSection />
                <HowItWorksSection />
                <TemplateShowcaseSection />
                <BenefitsSection />
                <DemoSection />
                <TestimonialsSection />
                <PricingSection />
                <FaqSection />
            </main>
            <Footer />
        </div>
    );
}
