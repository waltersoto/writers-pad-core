# WritersPad Playground

This is the official demo and testing application for [WritersPad Core](../WritersPad.Core). It is an ASP.NET Core MVC application designed to showcase the features of the editor in a real-world scenario.

## Prerequisites

-   [.NET 8.0 SDK](https://dotnet.microsoft.com/download) or later.
-   Node.js (for building the core library if you plan to modify it).

## Getting Started

1.  **Clone the repository** (if you haven't already).
2.  **Navigate to the Playground directory**:
    ```bash
    cd WritersPad.Playground
    ```
3.  **Run the application**:
    ```bash
    dotnet run
    ```
4.  **Open your browser**:
    Navigate to `http://localhost:5251` (or the port shown in your terminal).

## Project Structure

-   `Controllers/`: ASP.NET MVC Controllers.
-   `Views/`: Razor views for the UI.
-   `wwwroot/lib/writerspad/`: Contains the built artifacts from the Core library.

## Updating the Core Library

If you make changes to `WritersPad.Core`, you need to rebuild it and copy the files to the Playground's wwwroot:

```bash
# In WritersPad.Core
npm run build

# Copy to Playground
cp dist/* ../WritersPad.Playground/wwwroot/lib/writerspad/
```
