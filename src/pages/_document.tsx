import React from "react";
import Document, { Head, Html, Main, NextScript } from "next/document";


export default class _Document extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link rel="manifest" href="/manifest.json" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
