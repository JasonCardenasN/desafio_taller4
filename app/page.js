"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [pageTitle, setPageTitle] = useState("");
  const [tests, setTests] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/datos/pruebas.json");
        const data = await res.json();

        let validTests = data.tests
          .map(test => ({ ...test, testDateObj: new Date(test.testDate) }))
          .filter(test => test.testDateObj > new Date())
          .sort((a, b) => a.testDateObj - b.testDateObj);

        setPageTitle(data.pageTitle);
        setTests(validTests);
      } catch (err) {
        console.error("Error cargando JSON:", err);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTests(prev =>
        prev.map(test => {
          const now = new Date();
          let diff = test.testDateObj - now;
          if (diff <= 0) diff = 0;
          return { ...test, diff };
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <main className="container">
      <h1>{pageTitle}</h1>
      <div className="test-list">
        {tests.length === 0 && <p>No hay pruebas próximas.</p>}
        {tests.map((test, i) => {
          let diff = test.diff ?? (test.testDateObj - new Date());
          let days = Math.floor(diff / (1000 * 60 * 60 * 24));
          let hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
          let minutes = Math.floor((diff / (1000 * 60)) % 60);
          let seconds = Math.floor((diff / 1000) % 60);

          if (diff <= 0) {
            days = hours = minutes = seconds = 0;
          }

          return (
            <div key={i} className="test-card">
              <div className="test-info">
                <strong>{test.subjectId}</strong> - {test.subjectName}
              </div>
              <div className={`countdown ${days < 7 ? "red" : ""}`}>
                {days} días, {hours}:{minutes}:{seconds}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
