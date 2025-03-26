# LLM Code Generation Comparison

This repository contains a comparison of different Large Language Models (LLMs) in their ability to generate code for a to-do application. The project demonstrates and analyzes how various LLMs approach the same task of creating a sophisticated to-do application.

## Models Compared

- **Sonnet 3.7**
- **Gemini Flash**
- **DeepSeek**
- **OpenAI o3**
- **Sonnet 3.5**

## Project Structure

Each model's implementation is in its own directory:

- `gemini-todo/` - Gemini Flash implementation
- `o3-todo-app/` - OpenAI o3 implementation
- `todo-app-deepseekV3/` - DeepSeek implementation
- `todo-app-sonnet35/` - Sonnet 3.5 implementation
- `todo-app-sonnet37/` - Sonnet 3.7 implementation

## Key Findings

### Similarities Across Models

- All models successfully implemented core to-do application functionality
- Common features include task categorization, priority levels, and due dates
- Consistent use of standard web technologies (HTML, CSS, JavaScript)
- Local storage implementation for task persistence

### Key Differences

#### UI/UX Polish and Modernity
- **Sonnet 3.7 & 3.5**: Modern, visually appealing UI with animations and transitions
- **DeepSeek**: Decent UI focus with theme toggling and responsive design
- **Gemini Flash & OpenAI o3**: More functional UIs prioritizing core functionality

#### Smart Feature Implementation
- **Sonnet 3.7 & 3.5**: More sophisticated features like task suggestions and natural language date parsing
- **OpenAI o3**: Basic smart features with predefined task suggestions
- **Gemini Flash & DeepSeek**: Focus on organizational features

#### Code Structure
- **Sonnet Models**: Class-based, structured JavaScript approach
- **Other Models**: More procedural/functional JavaScript style

## Detailed Analysis

For a complete analysis of the comparison, including metrics, feature comparisons, and technical insights, see [summary.md](summary.md).

## Technical Blog Insights

The comparison revealed several interesting technical aspects:

1. Architectural style differences between models
2. Varying interpretations of "sophisticated" requirements
3. Different approaches to UI/UX implementation
4. Varying levels of code structure and organization
5. Different interpretations of "smart" features

## Business Implications

Key business insights from this comparison:

1. Rapid prototyping capabilities
2. Trade-offs between development speed and feature completeness
3. UI/UX as a key differentiator between models
4. Potential for reduced development costs
5. Impact on developer roles and workflow

## License

This project is open source and available under the MIT License.