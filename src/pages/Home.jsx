import Hero from "../components/Hero";
import CoursesPage from "./CoursesPage";
import WhyChooseUs from "../components/WhyChooseUs";
import CTA from "../components/CTA";
import Testimonials from "../components/Testimonials";
import YouTubeGallery from "../components/YouTubeGallery";
import PhotoGallery from "../components/Photogallery";
import SEO from "../components/SEO";

export default function Home() {
  return (
    <>
    <SEO
      title="Margdarshak Career Institute – Top Coaching in Muzaffarpur"
      description="Join Margdarshak Career Institute for NEET, JEE & Board exams. Expert teachers, live classes, personal mentorship, and smart learning in Muzaffarpur, Bihar."
      keywords="NEET coaching, JEE coaching, Board exam coaching, Class 6-12 foundation, Muzaffarpur, Bihar, Margdarshak Career Institute"
      image="https://yourdomain.com/hero-og.jpg"
      url="https://yourdomain.com"
    />

      <Hero />
      <CoursesPage />
      <WhyChooseUs />
      <Testimonials />
      <PhotoGallery/>
      <CTA />
      <YouTubeGallery />  {/* No need to pass videos */}
    </>
  );
}
