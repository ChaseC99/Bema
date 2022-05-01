import request from "../../../util/request";

export async function fetchArticleData(articleId: number) {
  const data = await request("GET", "/api/internal/kb/articles?articleId=" + articleId);

  return {
    article: data.article
  };
}