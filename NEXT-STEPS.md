Step 4: User Configuration and File Type Support
Prompt:
"Add support in extension.ts for users to configure which base LSPs are used for different file types. Ensure the extension can handle multiple base languages (e.g., HTML, Markdown, JSON) and pass the correct configuration to the temple LSP as needed."

Step 5: Testing and Debugging Utilities
Prompt:
"Add logging and debugging utilities to both extension.ts and lsp_server.py to help trace the flow of diagnostics and requests between the extension, proxy, and temple LSP. Include example test cases for a templated file that exercises both temple and base diagnostics."

Step 6: Documentation and Usage Instructions
Prompt:
"Write clear documentation in README.md files for both vscode-temple-linter and temple-linter. Explain how the proxy architecture works, how to configure base LSPs, and how to interpret combined diagnostics in the editor."