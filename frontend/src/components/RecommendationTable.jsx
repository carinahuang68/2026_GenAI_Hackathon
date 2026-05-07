export default function RecommendationTable({ recommendations }) {
    const workloadColors = {
      light:    { background: "#EAF3DE", color: "#27500A" },
      balanced: { background: "#FAEEDA", color: "#633806" },
      heavy:    { background: "#FCEBEB", color: "#791F1F" },
    };
  
    return (
      <div
        style={{
          background: "white",
          border: "0.5px solid #e5e5e5",
          borderRadius: 12,
          overflow: "hidden",
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
            padding: "1rem 1.25rem 0.75rem",
          }}
        >
          Recommended courses
        </div>
  
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                {["Course", "Best professor", "Match", "Workload", "Why it fits", "Warning"].map((h) => (
                  <th
                    key={h}
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: "#aaa",
                      textAlign: "left",
                      padding: "8px 12px",
                      borderBottom: "0.5px solid #e5e5e5",
                      background: "#f9f9f9",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recommendations.map((rec, i) => {
                const workloadStyle = workloadColors[rec.workload?.toLowerCase()] || workloadColors.balanced;
                const bestProf = rec.professors?.[0]?.name || "—";
                const matchColor =
                  rec.overall_match >= 80
                    ? "#1D9E75"
                    : rec.overall_match >= 60
                    ? "#f59e0b"
                    : "#e53e3e";
  
                return (
                  <tr
                    key={i}
                    style={{ borderBottom: i < recommendations.length - 1 ? "0.5px solid #e5e5e5" : "none" }}
                  >
                    {/* Course */}
                    <td style={{ padding: "10px 12px", verticalAlign: "middle" }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#1d4ed8",
                          background: "#eff6ff",
                          padding: "2px 7px",
                          borderRadius: 999,
                          display: "inline-block",
                          marginBottom: 3,
                        }}
                      >
                        {rec.course}
                      </span>
                      <div style={{ fontSize: 13, color: "#111" }}>{rec.title}</div>
                    </td>
  
                    {/* Best professor */}
                    <td style={{ padding: "10px 12px", verticalAlign: "middle", color: "#666", whiteSpace: "nowrap" }}>
                      {bestProf}
                    </td>
  
                    {/* Match */}
                    <td style={{ padding: "10px 12px", verticalAlign: "middle" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div
                          style={{
                            width: 48,
                            height: 5,
                            background: "#f0f0f0",
                            borderRadius: 999,
                            overflow: "hidden",
                            flexShrink: 0,
                          }}
                        >
                          <div
                            style={{
                              height: 5,
                              width: `${rec.overall_match ?? 0}%`,
                              background: matchColor,
                              borderRadius: 999,
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 500, color: "#111", whiteSpace: "nowrap" }}>
                          {rec.overall_match ?? "—"}%
                        </span>
                      </div>
                    </td>
  
                    {/* Workload */}
                    <td style={{ padding: "10px 12px", verticalAlign: "middle" }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 500,
                          padding: "2px 8px",
                          borderRadius: 999,
                          whiteSpace: "nowrap",
                          ...workloadStyle,
                        }}
                      >
                        {rec.workload}
                      </span>
                    </td>
  
                    {/* Why it fits */}
                    <td
                      style={{
                        padding: "10px 12px",
                        verticalAlign: "middle",
                        fontSize: 12,
                        color: "#666",
                        maxWidth: 180,
                      }}
                    >
                      {rec.reason}
                    </td>
  
                    {/* Warning */}
                    <td
                      style={{
                        padding: "10px 12px",
                        verticalAlign: "middle",
                        fontSize: 11,
                        color: "#854F0B",
                        maxWidth: 140,
                      }}
                    >
                      {rec.warning ? `⚠ ${rec.warning}` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }