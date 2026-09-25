# PDF.js

The unmodified display module, worker, character maps, fonts, decoders and licenses are from
Mozilla's `pdfjs-dist` **6.3.289** npm package (Apache-2.0).

Package: https://www.npmjs.com/package/pdfjs-dist/v/6.3.289
Documentation: https://mozilla.github.io/pdf.js/examples/
Source: https://github.com/mozilla/pdf.js

The downloaded npm archive was verified against its registry SHA-512 integrity:
`sha512-ZHjSVpDa3D6izMq8/04lvkhkATUmL9px6ChPaXc1k6nU2Mrhlg1/7F0bdUqCwUjw3NsPTfPZsMDUU6ZIcRaeQw==`.

The reader loads these files lazily. Standard fonts, character maps and image
decoders are bundled locally from the same verified package, so reading local
PDFs requires no third-party CDN. No PDF files are copied through a proxy. Remote
PDFs must allow cross-origin access for the controlled reader; the browser
reader remains available when they do not.

PDF scripting and XFA are not enabled. `isEvalSupported` is false. Update the
display module, worker, and `PDFJS_VERSION` in `assets/pdf-reader.js` together.
