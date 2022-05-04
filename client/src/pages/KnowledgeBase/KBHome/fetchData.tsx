import request from "../../../util/request";

export async function fetchSectionArticles(sectionId: number) {
  const data = await request("GET", "/api/internal/kb/articles?sectionId=" + sectionId);

  return {
    articles: data.articles
  };
}

export async function fetchSections() {
  const data = await request("GET", "/api/internal/kb/sections");

  return {
    sections: data.sections
  };
}