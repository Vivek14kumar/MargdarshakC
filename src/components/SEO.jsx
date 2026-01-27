// src/components/SEO.jsx
import { Helmet } from "react-helmet-async";

export default function SEO({
  title = "Margdarshak Career Institute – Best Coaching in Muzaffarpur",
  description = "Margdarshak Career Institute offers expert coaching for Board, NEET & JEE exams with top faculty and personal mentorship in Muzaffarpur, Bihar.",
  keywords = "NEET, JEE, Board exams, coaching, Muzaffarpur, Bihar, Margdarshak Career Institute",
  image = "https://yourdomain.com/og-image.jpg",
  url = "https://yourdomain.com",
}) {
  return (
    <Helmet>
      {/* Basic SEO */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />

      {/* Open Graph / Facebook */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
