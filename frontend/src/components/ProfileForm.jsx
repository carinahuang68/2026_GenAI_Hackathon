import { useState } from "react";

const LEARNING_STYLES = ["project-based", "applied", "theory", "lab"];
const ASSESSMENTS = ["exams", "projects", "essays", "assignments"];
const INTERESTS = ["AI", "systems", "HCI", "security", "databases", "theory", "networks", "graphics"];
const MBTI_TYPES = [
  "INTJ","INTP","ENTJ","ENTP",
  "INFJ","INFP","ENFJ","ENFP",
  "ISTJ","ISFJ","ESTJ","ESFJ",
  "ISTP","ISFP","ESTP","ESFP",
];

function TagInput({ placeholder, value, onChange }) {
  const [input, setInput] = useState("");

  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      if (!value.includes(input.trim())) {
        onChange([...value, input.trim()]);
      }
      setInput("");
    }
    if (e.key === "Backspace" && !input && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (idx) => onChange(value.filter((_, i) => i !== idx));

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        padding: "6px 8px",
        border: "0.5px solid #ccc",
        borderRadius: 8,
        minHeight: 38,
        cursor: "text",
        alignItems: "center",
        background: "white",
      }}
      onClick={(e) => e.currentTarget.querySelector("input").focus()}
    >
      {value.map((tag, i) => (
        <span
          key={i}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "2px 8px",
            borderRadius: 999,
            background: "#f0f0f0",
            border: "0.5px solid #ddd",
            fontSize: 12,
          }}
        >
          {tag}
          <button
            onClick={() => removeTag(i)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              fontSize: 12,
              color: "#888",
              lineHeight: 1,
            }}
            aria-label={`Remove ${tag}`}
          >
            ✕
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : ""}
        style={{
          border: "none",
          outline: "none",
          background: "transparent",
          fontSize: 13,
          minWidth: 80,
          flex: 1,
        }}
      />
    </div>
  );
}

function ChipGroup({ options, value, onChange }) {
  const toggle = (val) => {
    if (value.includes(val)) onChange(value.filter((v) => v !== val));
    else onChange([...value, val]);
  };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {options.map((opt) => (
        <span
          key={opt}
          onClick={() => toggle(opt)}
          style={{
            padding: "4px 12px",
            borderRadius: 999,
            border: value.includes(opt) ? "1px solid #3b82f6" : "0.5px solid #ccc",
            background: value.includes(opt) ? "#eff6ff" : "white",
            color: value.includes(opt) ? "#1d4ed8" : "#333",
            fontSize: 12,
            cursor: "pointer",
            userSelect: "none",
            transition: "all 0.15s",
          }}
        >
          {opt}
        </span>
      ))}
    </div>
  );
}

function Toggle({ value, onChange, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: 13, color: "#333" }}>{label}</span>
      <div
        onClick={() => onChange(!value)}
        style={{
          width: 36,
          height: 20,
          borderRadius: 999,
          background: value ? "#3b82f6" : "#ccc",
          position: "relative",
          cursor: "pointer",
          transition: "background 0.2s",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 3,
            left: value ? 19 : 3,
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: "white",
            transition: "left 0.2s",
          }}
        />
      </div>
    </div>
  );
}

const Section = ({ title, children }) => (
  <div
    style={{
      background: "white",
      border: "0.5px solid #e5e5e5",
      borderRadius: 12,
      padding: "1.25rem",
      marginBottom: "1rem",
    }}
  >
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: "#888",
        textTransform: "uppercase",
        letterSpacing: "0.07em",
        marginBottom: "1rem",
      }}
    >
      {title}
    </div>
    {children}
  </div>
);

const Field = ({ label, children, style }) => (
  <div style={{ marginBottom: "1rem", ...style }}>
    <label style={{ display: "block", fontSize: 13, color: "#555", marginBottom: 6 }}>{label}</label>
    {children}
  </div>
);

const Select = ({ id, value, onChange, options }) => (
  <select
    id={id}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    style={{
      width: "100%",
      padding: "8px 10px",
      fontSize: 13,
      border: "0.5px solid #ccc",
      borderRadius: 8,
      background: "white",
      color: "#333",
    }}
  >
    <option value="">Select...</option>
    {options.map((o) => (
      <option key={o.value} value={o.value}>{o.label}</option>
    ))}
  </select>
);

export default function ProfileForm({ onSubmit }) {
  const [form, setForm] = useState({
    major: "",
    transcript: [],
    courses_enjoyed: [],
    courses_disliked: [],
    professors_liked: [],
    learning_style: [],
    work_style: "",
    assessment_preference: [],
    lecture_style: "",
    career_path: "",
    technical_interests: [],
    breadth_or_depth: "",
    graduating_soon: false,
    num_courses: 3,
    working_part_time: false,
    time_preference: "",
    mbti: "",
    workload_tolerance: "",
    term_goal: "",
    open_chat: "",
  });

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = () => {
    if (onSubmit) onSubmit(form);
  };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "1.5rem 1rem" }}>

      <Section title="Student Profile">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Major">
            <input
              type="text"
              value={form.major}
              onChange={(e) => set("major")(e.target.value)}
              placeholder="e.g. Computer Science"
              style={{ width: "100%", padding: "8px 10px", fontSize: 13, border: "0.5px solid #ccc", borderRadius: 8 }}
            />
          </Field>
          <Field label="Courses taken (press Enter to add)">
            <TagInput placeholder="e.g. CPSC 110" value={form.transcript} onChange={set("transcript")} />
          </Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Courses enjoyed">
            <TagInput placeholder="e.g. CPSC 221" value={form.courses_enjoyed} onChange={set("courses_enjoyed")} />
          </Field>
          <Field label="Courses disliked">
            <TagInput placeholder="e.g. CPSC 213" value={form.courses_disliked} onChange={set("courses_disliked")} />
          </Field>
        </div>
        <Field label="Professors you liked">
          <TagInput placeholder="e.g. Dr. Smith" value={form.professors_liked} onChange={set("professors_liked")} />
        </Field>
      </Section>

      <Section title="Learning Style">
        <Field label="How do you learn best?">
          <ChipGroup options={LEARNING_STYLES} value={form.learning_style} onChange={set("learning_style")} />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Work style">
            <Select
              value={form.work_style}
              onChange={set("work_style")}
              options={[
                { value: "solo", label: "Solo" },
                { value: "group", label: "Group" },
                { value: "mixed", label: "Mixed" },
              ]}
            />
          </Field>
          <Field label="Lecture style preference">
            <Select
              value={form.lecture_style}
              onChange={set("lecture_style")}
              options={[
                { value: "slides", label: "Slides" },
                { value: "chalk-talk", label: "Chalk-talk" },
                { value: "flipped", label: "Flipped classroom" },
                { value: "no preference", label: "No preference" },
              ]}
            />
          </Field>
        </div>
        <Field label="Assessment preference">
          <ChipGroup options={ASSESSMENTS} value={form.assessment_preference} onChange={set("assessment_preference")} />
        </Field>
      </Section>

      <Section title="Goals">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Career path">
            <Select
              value={form.career_path}
              onChange={set("career_path")}
              options={[
                { value: "industry", label: "Industry" },
                { value: "research", label: "Research" },
                { value: "grad school", label: "Grad school" },
                { value: "co-op", label: "Co-op" },
                { value: "unsure", label: "Unsure" },
              ]}
            />
          </Field>
          <Field label="Breadth or depth?">
            <Select
              value={form.breadth_or_depth}
              onChange={set("breadth_or_depth")}
              options={[
                { value: "breadth", label: "Breadth" },
                { value: "depth", label: "Depth" },
                { value: "no preference", label: "No preference" },
              ]}
            />
          </Field>
        </div>
        <Field label="Technical interests">
          <ChipGroup options={INTERESTS} value={form.technical_interests} onChange={set("technical_interests")} />
        </Field>
        <Toggle label="Graduating soon?" value={form.graduating_soon} onChange={set("graduating_soon")} />
      </Section>

      <Section title="Schedule">
        <Field label={`Number of courses: ${form.num_courses}`}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: "#888" }}>1</span>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={form.num_courses}
              onChange={(e) => set("num_courses")(parseInt(e.target.value))}
              style={{ flex: 1 }}
            />
            <span style={{ fontSize: 12, color: "#888" }}>5</span>
          </div>
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Time preference">
            <Select
              value={form.time_preference}
              onChange={set("time_preference")}
              options={[
                { value: "morning", label: "Morning" },
                { value: "afternoon", label: "Afternoon" },
                { value: "no preference", label: "No preference" },
              ]}
            />
          </Field>
          <div style={{ display: "flex", alignItems: "center", paddingTop: 20 }}>
            <Toggle label="Working part-time?" value={form.working_part_time} onChange={set("working_part_time")} />
          </div>
        </div>
      </Section>

      <Section title="Personality">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="MBTI type">
            <Select
              value={form.mbti}
              onChange={set("mbti")}
              options={MBTI_TYPES.map((t) => ({ value: t, label: t }))}
            />
          </Field>
          <Field label="Workload tolerance">
            <Select
              value={form.workload_tolerance}
              onChange={set("workload_tolerance")}
              options={[
                { value: "light", label: "Light" },
                { value: "balanced", label: "Balanced" },
                { value: "heavy", label: "Heavy" },
              ]}
            />
          </Field>
        </div>
        <Field label="Term goal">
          <Select
            value={form.term_goal}
            onChange={set("term_goal")}
            options={[
              { value: "chill", label: "Chill" },
              { value: "balanced", label: "Balanced" },
              { value: "challenging", label: "Challenging" },
            ]}
          />
        </Field>
      </Section>

      <Section title="Anything else?">
        <Field label="Tell us anything that doesn't fit above — preferences, context, goals">
          <textarea
            value={form.open_chat}
            onChange={(e) => set("open_chat")(e.target.value)}
            placeholder="e.g. I hated CPSC 213 because it felt too low-level. I want ML internships and prefer weekly assignments over finals."
            style={{
              width: "100%",
              padding: "8px 10px",
              fontSize: 13,
              border: "0.5px solid #ccc",
              borderRadius: 8,
              minHeight: 80,
              resize: "vertical",
              fontFamily: "inherit",
            }}
          />
        </Field>
      </Section>

      <button
        onClick={handleSubmit}
        style={{
          width: "100%",
          padding: 12,
          fontSize: 15,
          fontWeight: 500,
          background: "#111",
          color: "white",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          marginTop: "0.5rem",
        }}
      >
        Get my recommendations →
      </button>
    </div>
  );
}