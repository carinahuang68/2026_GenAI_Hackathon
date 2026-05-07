import { useState } from "react";
import ProfileForm from "./components/ProfileForm";
import RecommendationCard from "./components/CourseRecommendationCard";
import RecommendationTable from "./components/RecommendationTable";

const API_URL = "https://YOUR_API_URL/recommend"; // swap this with Person 2's endpoint

export default function App() {
  const [page, setPage] = useState("form"); // "form" | "loading" | "results"
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

//   const handleSubmit = async (formData) => {
//     setPage("loading");
//     setError(null);

//     try {
//       const res = await fetch(API_URL, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData),
//       });

//       const data = await res.json();

//       if (!data.success) {
//         throw new Error(data.error || "Something went wrong");
//       }

//       setResults(data);
//       setPage("results");
//     } catch (err) {
//       setError(err.message);
//       setPage("form");
//     }
//   };

const handleSubmit = async (formData) => {
    setPage("loading");
    setTimeout(() => {
      setResults({
        profile_summary: "You're a 3rd year CS student who prefers project-based learning and aims for ML internships.",
        recommendations: [
          {
            course: "CPSC 340",
            title: "Machine Learning",
            reason: "Matches your ML interest and project-based style.",
            workload: "heavy",
            overall_match: 88,
            skills_gained: ["ML", "Python", "Statistics"],
            warning: "Math intensive",
            professors: [
              {
                name: "Dr. Smith",
                professor_style: "Structured, detailed feedback",
                student_experience: "Strong practical assignments",
                match_scores: { learning_style: 90, goals: 95, grades: 80, personality: 75, professor_match: 88 }
              },
              {
                name: "Dr. Lee",
                professor_style: "Fast paced, research oriented",
                student_experience: "Better for grad school",
                match_scores: { learning_style: 70, goals: 85, grades: 90, personality: 60, professor_match: 72 }
              }
            ]
          }
        ]
      });
      setPage("results");
    }, 1500);
  };

  const handleBack = () => {
    setResults(null);
    setPage("form");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f9f9f9" }}>

      {/* Nav */}
      <div
        style={{
          borderBottom: "0.5px solid #e5e5e5",
          background: "white",
          padding: "0 1.5rem",
          height: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 600, color: "#111" }}>
          CourseCompass
        </div>
        {page === "results" && (
          <button
            onClick={handleBack}
            style={{
              fontSize: 13,
              color: "#555",
              background: "none",
              border: "0.5px solid #ddd",
              borderRadius: 8,
              padding: "5px 12px",
              cursor: "pointer",
            }}
          >
            ← Start over
          </button>
        )}
      </div>

      {/* Form page */}
      {page === "form" && (
        <div>
          {error && (
            <div
              style={{
                maxWidth: 680,
                margin: "1rem auto 0",
                padding: "10px 14px",
                background: "#FCEBEB",
                color: "#791F1F",
                borderRadius: 8,
                fontSize: 13,
              }}
            >
              ⚠ {error}
            </div>
          )}
          <ProfileForm onSubmit={handleSubmit} />
        </div>
      )}

      {/* Loading page */}
      {page === "loading" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              border: "3px solid #e5e5e5",
              borderTop: "3px solid #111",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <div style={{ fontSize: 14, color: "#888" }}>
            Finding your best courses...
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Results page */}
      {page === "results" && results && (
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "1.5rem 1rem" }}>

          {/* Profile summary */}
          {results.profile_summary && (
            <div
              style={{
                background: "white",
                border: "0.5px solid #e5e5e5",
                borderRadius: 12,
                padding: "1.25rem",
                marginBottom: "1.5rem",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#aaa",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 8,
                }}
              >
                Your profile
              </div>
              <div style={{ fontSize: 14, color: "#444", lineHeight: 1.7 }}>
                {results.profile_summary}
              </div>
            </div>
          )}

          {/* Results header */}
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#aaa",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 12,
            }}
          >
            {results.recommendations?.length} courses recommended for you
          </div>

          {/* Summary table */}
          {results.recommendations && (
            <RecommendationTable recommendations={results.recommendations} />
          )}

          {/* Recommendation cards */}
          {results.recommendations?.map((rec, i) => (
            <RecommendationCard key={i} recommendation={rec} />
          ))}
        </div>
      )}
    </div>
  );
}