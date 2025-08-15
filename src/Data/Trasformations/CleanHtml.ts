export const cleanHtmlWithRewriter = async (htmlContent: string): Promise<string> => {
  let clearContent = "";
  const htmlRewriter = new HTMLRewriter()
    .on("*", {
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

