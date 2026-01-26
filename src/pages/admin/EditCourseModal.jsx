import { X } from "lucide-react";
import useAuth from "../../hooks/userAuth";

export default function EditCourseModal({ course, onClose, onSaved }) {
  const { user } = useAuth();

  const save = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/.netlify/functions/updateCourse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course.id,
          title: e.target.title.value,
          desc: e.target.desc.value,
          duration: e.target.duration.value,
          highlight: e.target.highlight.value,
          uid: user.uid,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.message || "Update failed");
        return;
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error("Error updating course:", err);
      alert("Server error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form
        onSubmit={save}
        className="bg-white w-full max-w-lg rounded-xl p-6 shadow-lg space-y-4"
      >
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">Edit Course</h3>
          <button onClick={onClose} type="button">
            <X />
          </button>
        </div>

        <input
          name="title"
          defaultValue={course.title}
          className="input"
          required
        />

        <textarea
          name="desc"
          defaultValue={course.desc}
          className="input"
          rows={3}
          required
        />

        <input
          name="duration"
          defaultValue={course.duration}
          className="input"
          required
        />

        <input
          name="highlight"
          defaultValue={course.highlight}
          className="input"
        />

        <button className="w-full bg-indigo-600 text-white py-2 rounded-lg">
          Save Changes
        </button>
      </form>
    </div>
  );
}
