function SurveyComponent() {
  const survey = new Survey.Model(json);
  survey.applyTheme(themeJson);

  survey.onComplete.add(async (sender) => {
    const data = sender.data;
    console.log("Survey data:", JSON.stringify(data, null, 2));

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        console.error("Failed to save survey:", await res.text());
      }
    } catch (e) {
      console.error("Error calling /api/submit:", e);
    }
  });

  return <SurveyReact.Survey model={survey} />;
}

const root = ReactDOM.createRoot(document.getElementById("surveyElement"));
root.render(<SurveyComponent />);