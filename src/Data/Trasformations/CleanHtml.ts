export const cleanHtmlWithRewriter = async (htmlContent: string, tag: string = "*"): Promise<string> => {
  let clearContent = "";
  const htmlRewriter = new HTMLRewriter()
    .on(tag, {
      text: (text) => {
        clearContent += text.text.trim();
      }
    });

  const response = new Response(htmlContent, {
    headers: { 'Content-Type': 'text/html' }
  });

  await htmlRewriter.transform(response).text();

  return clearContent;
}

export async function extractBody(response: Response): Promise<Response> {
  const rewriter = new HTMLRewriter()
    .on('head', {
      element: (element) => {
        element.remove()
      }
    })
    .on('*', {
      element: (element) => {
        if (element.tagName !== 'body') {
          element.remove();
        }
      }
    });

  return rewriter.transform(response);
}
