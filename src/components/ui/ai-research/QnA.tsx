"use client";

import { useChat } from "@ai-sdk/react";
import React, { useEffect } from "react";

import { useAIResearchStore } from "@/store/aiResearch";

import QuestionForm from "./QuestionForm";
import ResearchTimer from "./ResearchTimer";
import ResearchReport from "./ResearchReport";
import ResearchActivities from "./ResearchActivities";
import CompletedQuestions from "./CompletedQuestions";

const QnA = () => {
  const {
    questions,
    isCompleted,
    topic,
    answers,
    setIsLoading,
    setActivities,
    setSources,
    setReport,
  } = useAIResearchStore();

  const { append, data, status } = useChat({
    api: "/api/ai-research",
  });

  useEffect(() => {
    if (!data) return;

    // extract activities and sources
    const messages = data as unknown[];
    const activities = messages
      .filter(
        (msg) => typeof msg === "object" && (msg as any).type === "activity"
      )
      .map((msg) => (msg as any).content);

    setActivities(activities);

    const sources = activities
      .filter(
        (activity) =>
          activity.type === "extract" && activity.status === "complete"
      )
      .map((activity) => {
        const url = activity.message.split("from ")[1];
        return {
          url,
          title: url?.split("/")[2] || url,
        };
      });
    setSources(sources);
    const reportData = messages.find(
      (msg) => typeof msg === "object" && (msg as any).type === "report"
    );
    const report =
      typeof (reportData as any)?.content === "string"
        ? (reportData as any).content
        : "";
    setReport(report);

    setIsLoading(status === "streaming" || status === "submitted");
  }, [data, setActivities, setSources, setReport, setIsLoading, status]);

  useEffect(() => {
    if (isCompleted && questions.length > 0) {
      const clarifications = questions.map((question, index) => ({
        question: question,
        answer: answers[index],
      }));

      append({
        role: "user",
        content: JSON.stringify({
          topic: topic,
          clarifications: clarifications,
        }),
      });
    }
  }, [isCompleted, questions, answers, topic, append]);

  if (questions.length === 0) return null;

  return (
    <div className="flex gap-4 w-full flex-col items-center mb-16">
      <QuestionForm />
      <CompletedQuestions />
      <ResearchTimer />
      <ResearchActivities />
      <ResearchReport />
    </div>
  );
};

export default QnA;
