import { FaChalkboardTeacher, FaLaptopCode, FaTrophy } from "react-icons/fa";
import SEO from "../components/SEO";
import ownerImg from "../assets/images/photo.jpg";

export default function About() {
  return (
    <>
    <SEO
      title="About Us – Margdarshak Career Institute"
      description="Learn about Margdarshak Career Institute, a trusted coaching center in Muzaffarpur, Bihar offering NEET, JEE, and Board exam coaching since 2015. Experienced faculty, smart classes, and personal mentorship."
      keywords="About Margdarshak Career Institute, NEET coaching, JEE coaching, Board exam preparation, Muzaffarpur, Bihar"
      image="https://yourdomain.com/about-og.jpg"
      url="https://yourdomain.com/about"
    />

    <main className="bg-gradient-to-b from-slate-50 to-white">

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold">
          About <span className="text-red-600">Margdarshak Career Institute</span>
        </h1>

        <p className="mt-6 max-w-4xl mx-auto text-gray-600 text-lg leading-relaxed">
          <strong>Margdarshak Career Institute</strong> एक भरोसेमंद और
          result-oriented coaching institute है, जहाँ
          <strong> Class 6th से 12th (CBSE & State Board)</strong> के छात्रों को
          <strong> BOARD Exams, NEET, JEE और Foundation Courses</strong> के लिए
          expert guidance दी जाती है।
          <br /><br />
          हमारा उद्देश्य हर छात्र को <strong>strong concept clarity</strong>,
          <strong> regular test practice</strong> और
          <strong> personal mentorship</strong> के माध्यम से academic excellence
          दिलाना है। Institute में <strong>experienced faculty</strong>,
          <strong> small batch size</strong>, dedicated doubt-solving sessions और
          exam-oriented study material उपलब्ध है।
          <br /><br />
          Physics, Chemistry, Biology और Mathematics जैसे subjects को
          <strong> NCERT syllabus</strong> और
          <strong> latest exam pattern</strong> के अनुसार पढ़ाया जाता है।
          Competitive exams जैसे <strong>NEET coaching</strong>,
          <strong> JEE coaching</strong>, Olympiad preparation और board exam
          tuition पर विशेष ध्यान दिया जाता है।
        </p>
      </section>

      {/* Feature Cards */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid gap-8 md:grid-cols-3">

          <div className="bg-white/80 backdrop-blur p-8 rounded-3xl shadow-lg hover:shadow-2xl transition text-center">
            <FaChalkboardTeacher className="text-4xl text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold">Expert & Dedicated Faculty</h3>
            <p className="mt-2 text-gray-600">
              Highly experienced teachers focused on concept clarity, discipline,
              and exam-oriented preparation.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur p-8 rounded-3xl shadow-lg hover:shadow-2xl transition text-center">
            <FaLaptopCode className="text-4xl text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold">Smart Classes & Study Support</h3>
            <p className="mt-2 text-gray-600">
              Smart board classrooms, regular practice sheets, tests, and
              continuous academic support.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur p-8 rounded-3xl shadow-lg hover:shadow-2xl transition text-center">
            <FaTrophy className="text-4xl text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold">Proven Academic Results</h3>
            <p className="mt-2 text-gray-600">
              Consistent success in Board examinations with growing achievements
              in NEET and JEE preparations.
            </p>
          </div>

        </div>
      </section>

      {/* Founder / Owner Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">

          {/* Image */}
          <div className="flex justify-center">
            <img
              src={ownerImg}
              alt="Founder of Margdarshak Career Institute"
              loading="lazy"
              className="w-72 h-72 object-cover rounded-3xl shadow-xl"
            />
          </div>

          {/* Content */}
          <div>
            <h2 className="text-2xl  font-bold mb-4 md:text-3xl">
              Message from the Founder
            </h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Our vision is not just to teach subjects, but to shape disciplined,
              confident, and responsible students. We believe that with the
              right guidance, mentorship, and environment, every student can
              achieve academic excellence and build a successful future.
            </p>
            <p className="font-semibold text-red-600">
              — Founder, Margdarshak Career Institute
            </p>
          </div>

        </div>
      </section>

    </main>
    </>
  );
}
