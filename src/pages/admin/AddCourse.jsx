import { useForm, useFieldArray } from "react-hook-form";
/*import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where
} from "firebase/firestore";*/
import { firestore } from "../../firebaseConfig";
import CourseTable from "./CourseTable";
import useAuth from "../../hooks/userAuth";

export default function AddCourseForm() {
  const { user, loading } = useAuth();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting, isSubmitSuccessful }
  } = useForm({
    defaultValues: {
      title: "",
      desc: "",
      duration: "",
      highlight: "",
      features: [{ text: "", icon: "book" }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "features"
  });

  if (loading) return <p>Checking auth...</p>;
  if (!user) return <p className="text-red-600">Access denied</p>;

  const generateSlug = (text) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  /* ================= NOTIFY STUDENTS ================= 
  const notifyStudents = async (courseTitle, courseSlug) => {
  const usersSnap = await getDocs(
    query(collection(firestore, "users"), where("role", "==", "student"))
  );

  console.log("Students found:", usersSnap.size);

  if (usersSnap.empty) {
    console.warn("No students found – no notifications sent");
    return;
  }

  const batch = usersSnap.docs.map((u) =>
    addDoc(collection(firestore, "notifications"), {
      uid: u.id,
      type: "course",
      title: "New Course Available",
      message: `${courseTitle} course is now live`,
      courseTitle,
      courseSlug,
      read: false,
      createdAt: serverTimestamp()
    })
  );

  await Promise.all(batch);
};*/


  const onSubmit = async (data) => {
  try {
    const res = await fetch("/.netlify/functions/addCourse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        uid: user.uid,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      alert(result.message || "Failed to add course");
      return;
    }

    reset();
    console.log("Course added:", result.courseId);
  } catch (err) {
    console.error("Error:", err);
    alert("Server error");
  }
};


  return (
    <div className="w-full space-y-6">
      {/* ADD COURSE FORM */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-2">Add New Course</h2>

        {isSubmitSuccessful && (
          <p className="text-emerald-600 text-xs mb-2">
            ✓ Course added successfully
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <Input label="Course Title" {...register("title", { required: true })} />
            <Input label="Duration" {...register("duration", { required: true })} />
          </div>

          <Textarea label="Description" {...register("desc", { required: true })} />
          <Input label="Highlight" {...register("highlight")} />

          {/* FEATURES */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700">
              Course Features
            </p>

            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <select
                  {...register(`features.${index}.icon`)}
                  className="border rounded-md px-2 text-sm"
                >
                  <option value="book">📘 Book</option>
                  <option value="video">🎥 Video</option>
                  <option value="clipboard">📝 Test</option>
                  <option value="chat">💬 Doubt</option>
                  <option value="user">👨‍🏫 Mentor</option>
                  <option value="clock">⏱️ Time</option>
                  <option value="document">📄 PDF</option>
                </select>

                <input
                  {...register(`features.${index}.text`)}
                  placeholder="Feature text"
                  className="flex-1 border rounded-md px-2 text-sm"
                />

                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-500 text-sm"
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => append({ text: "", icon: "book" })}
              className="text-indigo-600 text-xs font-medium"
            >
              + Add Feature
            </button>
          </div>

          <button
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 rounded-md text-sm transition"
          >
            {isSubmitting ? "Adding..." : "Add Course"}
          </button>
        </form>
      </div>

      <CourseTable />
    </div>
  );
}

/* ================= UI ================= */
function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-0.5">
        {label}
      </label>
      <input
        {...props}
        className="w-full border rounded-md px-2.5 py-1.5 text-sm focus:ring-1 focus:ring-indigo-500"
      />
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-0.5">
        {label}
      </label>
      <textarea
        {...props}
        rows={2}
        className="w-full border rounded-md px-2.5 py-1.5 text-sm focus:ring-1 focus:ring-indigo-500 resize-none"
      />
    </div>
  );
}
