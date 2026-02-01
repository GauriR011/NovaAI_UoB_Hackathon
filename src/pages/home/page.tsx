import HeroSection from './components/HeroSection';
import Footer from './components/Footer';
import Navigation from './components/Navigation';

export default function Home() {
  return (
    <div className="relative bg-white">
      <Navigation scrolled={false} />
      <HeroSection />
      <Footer />
    </div>
  );
}
