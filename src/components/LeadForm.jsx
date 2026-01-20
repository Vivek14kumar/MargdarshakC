export default function LeadForm() {
  return (
    <form className="bg-white p-6 rounded-xl shadow space-y-4">
      <h3 className="text-xl font-bold text-center">
        Get Free Counseling
      </h3>

      <input
        type="text"
        placeholder="Student Name"
        className="w-full border p-3 rounded"
        required
      />

      <input
        type="tel"
        placeholder="Mobile Number"
        className="w-full border p-3 rounded"
        required
      />

      <select className="w-full border p-3 rounded">
        <option>Select Course</option>
        <option>SSC / Banking</option>
        <option>NEET / JEE</option>
        <option>Class 6–12</option>
        <option>Computer Course</option>
      </select>

      <button className="w-full bg-blue-600 text-white py-3 rounded font-semibold">
        Submit
      </button>
    </form>
  );
}
