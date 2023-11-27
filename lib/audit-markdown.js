import marked from "marked";

export function renderIssueContent(source) {
  return marked.marked(source, { renderer });
}

export function renderInlineContent(source) {
  return marked.parseInline(source, { renderer });
}

const renderer = new marked.Renderer({
  gfm: true,
});

//
// Markdown: Open external links in new pages
//
const originalLinkRenderer = renderer.link;
renderer.link = function (href, title, text) {
  const isLocal =
    href.match(/^[/#]/) || href.startsWith(`https://learnevm.com`);
  const html = originalLinkRenderer.call(renderer, href, title, text);
  return isLocal
    ? html
    : html.replace(
        /^<a /,
        `<a target="_blank" rel="noreferrer noopener nofollow" `
      );
};

export function sortByAndTransformDate(source) {
  return source
    .sort((a, b) => {
      a = Date.parse(a.date);
      b = Date.parse(b.date);
      return b - a;
    })
    .map((audit) => {
      audit.date = new Date(audit.date).toLocaleDateString("en-US", {
        timezone: "UTC",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      return audit;
    });
}
