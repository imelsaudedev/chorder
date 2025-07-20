"use server";

import { GoogleGenAI } from "@google/genai";
import { Octokit } from "@octokit/core";
import { getTranslations } from "next-intl/server";

const ai = new GoogleGenAI({});

const owner = "imelsaudedev";
const repo = "chorder";

type FeedbackActionState = {
  success: boolean;
  error?: string;
};
export async function postFeedback(
  _: FeedbackActionState,
  formData: FormData
): Promise<FeedbackActionState> {
  const t = await getTranslations("Feedback");

  const octokit = new Octokit({
    auth: process.env.GITHUB_ISSUES_TOKEN,
  });

  const type = formData.get("type") as string | null;
  const author = formData.get("author") as string | null;
  const content = formData.get("content") as string | null;

  if (!type || !content) {
    return { success: false, error: t("invalidFeedback") };
  }

  const baseTitle: string = await generateTitle(content);
  let title: string;
  const body = `**Author:** ${
    author || "Anonymous"
  }\n\n**Description:**\n${content}`;
  let labels: string[] = [];

  if (type === "bug") {
    title = `Bug${author ? ` [${author}]` : ""}: ${baseTitle}`;
    labels = ["bug"];
  } else if (type === "feature") {
    title = `Feat${author ? ` [${author}]` : ""}: ${baseTitle}`;
    labels = ["feature"];
  } else if (type === "other") {
    title = `Other${author ? ` [${author}]` : ""}: ${baseTitle}`;
    labels = ["feedback"];
  } else {
    return { success: false, error: t("invalidFeedback") };
  }

  const res = await octokit.request(`POST /repos/${owner}/${repo}/issues`, {
    owner,
    repo,
    title,
    body,
    labels,
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  const error = res.status !== 201 ? t("serverError") : undefined;
  return { success: res.status === 201, error };
}

async function generateTitle(content: string): Promise<string> {
  const defaultTitle = content.slice(0, 50);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite-preview-06-17",
      contents: `Return just the raw output text. Generate a concise title for the following feedback:\n\n${content}`,
    });

    return response.text?.trim() || defaultTitle;
  } catch (error) {
    console.error("Error generating title:", error);
    return defaultTitle;
  }
}
