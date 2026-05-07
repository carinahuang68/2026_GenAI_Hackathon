import { useEffect, useRef } from "react";

const PROF_COLORS = [
  { border: "#e53e3e", background: "rgba(229,62,62,0.15)" },
  { border: "#3b82f6", background: "rgba(59,130,246,0.15)" },
  { border: "#10b981", background: "rgba(16,185,129,0.15)" },
  { border: "#f59e0b", background: "rgba(245,158,11,0.15)" },
];

const AXES = ["Learning Style", "Goals", "Grades", "Personality", "Prof Match"];
const AXIS_KEYS = ["learning_style", "goals", "grades", "personality", "professor_match"];

function RadarChart({ professors }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const loadChart = async () => {
      if (!window.Chart) {
        await new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js";
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const ctx = canvasRef.current.getContext("2d");

      chartRef.current = new window.Chart(ctx, {
        type: "radar",
        data: {
          labels: AXES,
          datasets: professors.map((prof, i) => ({
            label: prof.name,
            data: AXIS_KEYS.map((key) => prof.match_scores?.[key] ?? 0),
            borderColor: PROF_COLORS[i % PROF_COLORS.length].border,
            backgroundColor: PROF_COLORS[i % PROF_COLORS.length].background,
            borderWidth: 2,
            pointBackgroundColor: PROF_COLORS[i % PROF_COLORS.length].border,
            pointRadius: 4,
          })),
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          scales: {
            r: {
              min: 0,
              max: 100,
              ticks: {
                stepSize: 25,
                font: { size: 10 },
                color: "#aaa",
                backdropColor: "transparent",
              },
              pointLabels: {
                font: { size: 12 },
                color: "#555",
              },
              grid: { color: "#e5e5e5" },
              angleLines: { color: "#e5e5e5" },
            },
          },
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                font: { size: 12 },
                color: "#555",
                padding: 16,
                usePointStyle: true,
              },
            },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw}`,
              },
            },
          },
        },
      });
    };

    loadChart();

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [professors]);

  return (
    <div style={{ maxWidth: 380, margin: "0 auto" }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

export default function RecommendationCard({ recommendation }) {
  const {
    course,
    title,
    reason,
    workload,
    skills_gained = [],
    warning,
    professors = [],
    overall_match,
  } = recommendation;

  const workloadColors = {
    light:    { background: "#EAF3DE", color: "#27500A" },
    balanced: { background: "#FAEEDA", color: "#633806" },
    heavy:    { background: "#FCEBEB", color: "#791F1F" },
  };

  const workloadStyle = workloadColors[workload?.toLowerCase()] || workloadColors.balanced;

  return (
    <div
      style={{
        background: "white",
        border: "0.5px solid #e5e5e5",
        borderRadius: 12,
        padding: "1.25rem",
        marginBottom: "1rem",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1rem" }}>
        <div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#1d4ed8",
              background: "#eff6ff",
              padding: "3px 8px",
              borderRadius: 999,
              marginBottom: 6,
              display: "inline-block",
            }}
          >
            {course}
          </span>
          <div style={{ fontSize: 17, fontWeight: 500, color: "#111" }}>{title}</div>
          <div style={{ fontSize: 12, color: "#888", marginTop: 4, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {professors.map((p, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: PROF_COLORS[i % PROF_COLORS.length].border,
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                {p.name}
              </span>
            ))}
          </div>
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: "3px 10px",
            borderRadius: 999,
            whiteSpace: "nowrap",
            ...workloadStyle,
          }}
        >
          {workload} workload
        </span>
      </div>
      {overall_match !== undefined && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }}>
          <div style={{ fontSize: 12, color: "#888" }}>Overall match</div>
          <div
            style={{
              flex: 1,
              height: 6,
              background: "#f0f0f0",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: 6,
                width: `${overall_match}%`,
                borderRadius: 999,
                background: overall_match >= 80 ? "#1D9E75" : overall_match >= 60 ? "#f59e0b" : "#e53e3e",
              }}
            />
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#111", minWidth: 32, textAlign: "right" }}>
            {overall_match}%
          </div>
        </div>
      )}

      {/* Reason */}
      <div
        style={{
          fontSize: 13,
          color: "#555",
          lineHeight: 1.6,
          marginBottom: "1rem",
          padding: "10px 12px",
          background: "#f8f8f8",
          borderRadius: 8,
        }}
      >
        {reason}
      </div>

      {/* Warning */}
      {warning && (
        <div
          style={{
            fontSize: 12,
            color: "#854F0B",
            background: "#FAEEDA",
            borderRadius: 8,
            padding: "8px 12px",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          ⚠ {warning}
        </div>
      )}

      {/* Skills */}
      {skills_gained.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
            Skills you'll gain
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: "1rem" }}>
            {skills_gained.map((skill, i) => (
              <span
                key={i}
                style={{
                  fontSize: 12,
                  padding: "3px 10px",
                  borderRadius: 999,
                  background: "#f0f0f0",
                  border: "0.5px solid #e0e0e0",
                  color: "#555",
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </>
      )}

      <hr style={{ border: "none", borderTop: "0.5px solid #eee", margin: "1rem 0" }} />

      {/* Radar Chart */}
      {professors.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
            Match scores by professor
          </div>
          <RadarChart professors={professors} />
        </>
      )}

      {/* Professor Details */}
      {professors.length > 0 && (
        <>
          <hr style={{ border: "none", borderTop: "0.5px solid #eee", margin: "1rem 0" }} />
          <div style={{ fontSize: 11, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
            Professor details
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {professors.map((prof, i) => (
              <div
                key={i}
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  borderLeft: `3px solid ${PROF_COLORS[i % PROF_COLORS.length].border}`,
                  background: "#fafafa",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 500, color: "#111", marginBottom: 4 }}>
                  {prof.name}
                </div>
                {prof.professor_style && (
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 2 }}>
                    {prof.professor_style}
                  </div>
                )}
                {prof.student_experience && (
                  <div style={{ fontSize: 12, color: "#888" }}>
                    {prof.student_experience}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}