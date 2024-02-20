"use client";

export default function Analytics() {
  return (
    <div className="h-screen">
      <iframe
        id="preview-frame"
        src="https://www.moesif.com/public/eyJhcHAiOiI5Nzk6Mjc5IiwiYXVkIjoiNnVaMG5PamZycjhOSWo0cjhJNk5OdXJTdkY3VlkybUwiLCJ2ZXIiOiIxIiwib3JnIjoiNTUyOjI0MyIsInBlcm1pc3Npb25zIjp7IjU1MjoyNDMiOnsic2NwIjoicmVhZDpwdWJsaWNfd29ya3NwYWNlcyJ9fSwiaXNzIjoiaHR0cHM6Ly93d3cubW9lc2lmLmNvbS93cmFwL2FwcC81NTI6MjQzLTk3OToyNzkiLCJvaWQiOiJ3b3Jrc3BhY2VzLzY0OGE0YWYwMzEyYWRmNWNkYzhiOWYyOSIsImlhdCI6MTcwNzIyMTc1NywianRpIjoiNWY3NTZmNTAtZTA5Yy00MTRhLWJmMGQtMjFlMGRkOWIzNzNhIn0.97j5Zn35Pmm5L8W5aofh1FrZFg06etc3PK1i5fLanE4/ws/648a4af0312adf5cdc8b9f29/-7d?embed=true"
        name="preview-frame"
        width="100%"
        height="100vh"
        style={{ border: "none" }}
        className="h-full"
      />
    </div>
  );
}
