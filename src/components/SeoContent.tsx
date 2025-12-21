// import React from 'react'

export function SeoContent() {
  return (
    <div className="max-w-4xl mx-auto mt-12 px-6 pb-12 text-zinc-600 dark:text-zinc-400">
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">How to use Payload.cool JSON Formatter?</h2>
        <p className="mb-4">
          Payload.cool is designed to be the fastest and most secure way to format and validate JSON data. 
          Simply paste your JSON code into the editor, or drag and drop a file. 
          The tool automatically detects the content and highlights syntax errors in real-time.
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Format:</strong> Click "Format" to beautify minified JSON with proper indentation (2 or 4 spaces).</li>
          <li><strong>Validate:</strong> Instantly spot missing commas, unclosed braces, or wrong data types.</li>
          <li><strong>Visualize:</strong> Switch to "Tree View" or "Graph View" to navigate deep nested structures effortlessly.</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Why Payload.cool is safer than other tools?</h2>
        <p className="mb-4">
          Most online JSON formatters send your data to a backend server for processing. 
          This creates a security risk, especially for sensitive API payloads, configuration files, or customer data.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-100 dark:border-blue-900/50">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">The Payload.cool Difference: Privacy-First Architecture</h3>
          <p>
            We use a <strong>Local-only</strong> architecture. Your data never leaves your browser. 
            All parsing, formatting, and validation happens right on your device using Web Workers. 
            This means zero latency and 100% data privacy. No logs, no tracking, no uploads.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Common JSON Errors We Fix</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Syntax Errors</h3>
            <p className="text-sm">Trailing commas, missing quotes around keys, or using single quotes instead of double quotes are the most frequent issues Payload.cool detects.</p>
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Data Type Issues</h3>
            <p className="text-sm">Identify where you accidentally used a string instead of a number, or null values that might break your application logic.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
