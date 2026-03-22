import { env } from '../config.js';

interface AIResponse {
  content: string;
  usage?: { promptTokens: number; completionTokens: number };
}

interface ChartSuggestion {
  chartType: 'line' | 'bar' | 'pie' | 'area' | 'table';
  xColumn: string;
  yColumn: string;
  title: string;
  reasoning: string;
}

interface Insight {
  type: 'trend' | 'anomaly' | 'recommendation' | 'summary';
  title: string;
  content: string;
  confidence: number;
}

/**
 * Call OpenAI-compatible API
 */
async function callAI(
  messages: Array<{ role: string; content: string }>,
  options?: { temperature?: number; maxTokens?: number },
): Promise<AIResponse> {
  const apiKey = env.OPENAI_API_KEY;
  const baseUrl = env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  const model = env.AI_MODEL || 'gpt-4o-mini';

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options?.temperature ?? 0.3,
      max_tokens: options?.maxTokens ?? 2048,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI API error: ${res.status} — ${err}`);
  }

  const data = await res.json() as any;
  return {
    content: data.choices[0].message.content,
    usage: data.usage
      ? { promptTokens: data.usage.prompt_tokens, completionTokens: data.usage.completion_tokens }
      : undefined,
  };
}

export const aiService = {
  /**
   * Analyze a file's data and generate insights
   */
  async analyzeFile(
    columns: Array<{ name: string; type: string }>,
    rows: Record<string, unknown>[],
    fileName: string,
  ): Promise<Insight[]> {
    const sample = rows.slice(0, 50);
    const prompt = `You are a data analyst. Analyze this dataset and provide 3-5 insights.

File: ${fileName}
Columns: ${JSON.stringify(columns)}
Sample data (first ${sample.length} rows):
${JSON.stringify(sample, null, 2)}

For each insight, respond in this exact JSON format (array of objects):
[
  {
    "type": "trend" | "anomaly" | "recommendation" | "summary",
    "title": "Short title",
    "content": "Detailed insight explanation",
    "confidence": 0.0-1.0
  }
]

Focus on: trends, anomalies, outliers, data quality issues, and actionable recommendations.
Respond ONLY with the JSON array, no other text.`;

    const response = await callAI([{ role: 'user', content: prompt }]);
    try {
      const cleaned = response.content.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
      return JSON.parse(cleaned);
    } catch {
      return [{
        type: 'summary',
        title: 'Analysis Complete',
        content: response.content,
        confidence: 0.8,
      }];
    }
  },

  /**
   * Natural language query about data — returns a chart suggestion
   */
  async queryData(
    question: string,
    columns: Array<{ name: string; type: string }>,
    rows: Record<string, unknown>[],
  ): Promise<ChartSuggestion & { filteredRows?: Record<string, unknown>[] }> {
    const sample = rows.slice(0, 30);
    const prompt = `You are a data visualization assistant. The user asked a question about their data.

Available columns: ${JSON.stringify(columns)}
Sample data: ${JSON.stringify(sample)}

User question: "${question}"

Respond in this exact JSON format:
{
  "chartType": "line" | "bar" | "pie" | "area" | "table",
  "xColumn": "column_name_for_x_axis",
  "yColumn": "column_name_for_y_axis",
  "title": "Chart title based on the question",
  "reasoning": "Why this visualization was chosen"
}

Pick the best chart type and columns for answering the question.
Respond ONLY with the JSON object.`;

    const response = await callAI([{ role: 'user', content: prompt }]);
    try {
      const cleaned = response.content.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
      return JSON.parse(cleaned);
    } catch {
      return {
        chartType: 'table',
        xColumn: columns[0]?.name || 'x',
        yColumn: columns.find((c) => c.type === 'number')?.name || 'y',
        title: question,
        reasoning: 'Could not parse AI response, showing data as table.',
      };
    }
  },

  /**
   * Suggest best chart type for given data
   */
  async suggestChart(
    columns: Array<{ name: string; type: string }>,
    rows: Record<string, unknown>[],
  ): Promise<ChartSuggestion> {
    const sample = rows.slice(0, 20);
    const prompt = `Given this dataset, suggest the best chart type and columns for visualization.

Columns: ${JSON.stringify(columns)}
Sample: ${JSON.stringify(sample)}

Respond in JSON:
{
  "chartType": "line" | "bar" | "pie" | "area",
  "xColumn": "best_x_column",
  "yColumn": "best_y_column",
  "title": "Suggested chart title",
  "reasoning": "Why this chart"
}
Respond ONLY with JSON.`;

    const response = await callAI([{ role: 'user', content: prompt }]);
    try {
      const cleaned = response.content.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
      return JSON.parse(cleaned);
    } catch {
      return {
        chartType: 'bar',
        xColumn: columns[0]?.name || 'x',
        yColumn: columns.find((c) => c.type === 'number')?.name || 'y',
        title: 'Data Overview',
        reasoning: 'Default suggestion',
      };
    }
  },

  /**
   * Summarize data into an executive summary
   */
  async summarize(
    columns: Array<{ name: string; type: string }>,
    rows: Record<string, unknown>[],
    fileName: string,
  ): Promise<string> {
    const sample = rows.slice(0, 50);
    const prompt = `Write a concise executive summary of this business data.

File: ${fileName}
Rows: ${rows.length}
Columns: ${columns.map((c) => `${c.name} (${c.type})`).join(', ')}
Sample data: ${JSON.stringify(sample)}

Provide a 3-5 sentence summary highlighting key metrics, trends, and notable findings.`;

    const response = await callAI(
      [{ role: 'user', content: prompt }],
      { maxTokens: 500 },
    );
    return response.content;
  },

  /**
   * Chat completion for conversational queries
   */
  async chat(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    dataContext?: { columns: Array<{ name: string; type: string }>; rows: Record<string, unknown>[] },
  ): Promise<string> {
    const systemPrompt = dataContext
      ? `You are a data analyst assistant. You have access to this dataset:
Columns: ${JSON.stringify(dataContext.columns)}
Sample (first 20 rows): ${JSON.stringify(dataContext.rows.slice(0, 20))}

Answer questions about this data clearly and concisely. Suggest visualizations when appropriate.`
      : `You are an AI business analyst assistant for SME InsightX. Help users understand their data, answer business questions, and suggest analyses. Be concise and actionable.`;

    const aiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    const response = await callAI(aiMessages);
    return response.content;
  },
};
