export async function printReportHtmlFromHiddenFrame(reportHtml: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.setAttribute("aria-hidden", "true");

    let closed = false;
    const cleanup = () => {
      if (closed) return;
      closed = true;
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    };

    iframe.onload = () => {
      const frameWindow = iframe.contentWindow;
      const frameDocument = iframe.contentDocument;
      if (!frameWindow || !frameDocument) {
        cleanup();
        reject(new Error("No se pudo iniciar el documento de impresion."));
        return;
      }

      const images = Array.from(frameDocument.images);
      const imagesReady = Promise.all(
        images.map(
          (image) =>
            new Promise<void>((imageReady) => {
              if (image.complete) {
                imageReady();
                return;
              }
              image.onload = () => imageReady();
              image.onerror = () => imageReady();
            })
        )
      );

      imagesReady
        .then(() => {
          let handled = false;
          const finalize = () => {
            if (handled) return;
            handled = true;
            cleanup();
            resolve();
          };

          frameWindow.addEventListener("afterprint", finalize, { once: true });
          frameWindow.focus();
          frameWindow.print();
          window.setTimeout(finalize, 2500);
        })
        .catch((error) => {
          cleanup();
          reject(error);
        });
    };

    document.body.appendChild(iframe);
    iframe.srcdoc = reportHtml;
  });
}
