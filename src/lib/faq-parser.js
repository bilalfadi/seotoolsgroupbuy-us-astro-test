/** Follow original WordPress FAQ template: parse Yoast FAQ fields when present. */
export function parseYoastFaq(html) {
  const src = String(html || '');
  const question = /<strong[^>]*class=["'][^"']*schema-faq-question[^"']*["'][^>]*>([\s\S]*?)<\/strong>/gi;
  const answer = /<p[^>]*class=["'][^"']*schema-faq-answer[^"']*["'][^>]*>([\s\S]*?)<\/p>/gi;
  const questions = [...src.matchAll(question)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
  const answers = [...src.matchAll(answer)].map(m => m[1].trim());
  if (questions.length !== answers.length) return [];
  return questions.map((q, i) => ({ q, a: answers[i], cat: 'all', html: true })).filter(x => x.q && x.a);
}
