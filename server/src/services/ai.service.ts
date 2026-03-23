import { env } from '../config.js';

interface AIResponse {
  content: string;
  usage?: { promptTokens: number; completionTokens: number };
}

export interface ChartSuggestion {
  chartType: 'line' | 'bar' | 'pie' | 'area' | 'table';
  xColumn: string;
  yColumn: string;
  title: string;
  reasoning: string;
}

export interface KeyMetric {
  title: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  description: string;
}

export interface Insight {
  type: 'trend' | 'anomaly' | 'recommendation' | 'summary';
  title: string;
  content: string;
  confidence: number;
}

export interface Recommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  impact: string;
  action: string;
}

export interface AnalysisChart {
  type: 'bar' | 'line' | 'pie';
  xColumn: string;
  yColumn: string;
  title: string;
}

export interface AnalysisResult {
  summary: string;
  keyMetrics: KeyMetric[];
  insights: Insight[];
  recommendations: Recommendation[];
  charts: AnalysisChart[];
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
      max_tokens: options?.maxTokens ?? 4096,
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

/**
 * Parse AI JSON response, stripping markdown fences
 */
function parseAIJSON<T>(content: string): T | null {
  try {
    const cleaned = content.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

export const aiService = {
  /**
   * Full analysis — returns structured results with summary, metrics, insights,
   * recommendations, and chart suggestions
   */
  async analyzeFile(
    columns: Array<{ name: string; type: string }>,
    rows: Record<string, unknown>[],
    fileName: string,
  ): Promise<AnalysisResult> {
    const sample = rows.slice(0, 50);
    const numericCols = columns.filter(c => c.type === 'number').map(c => c.name);
    const stringCols = columns.filter(c => c.type === 'string').map(c => c.name);
    const dateCols = columns.filter(c => c.type === 'date').map(c => c.name);

    const prompt = `You are a business analyst speaking to a non-technical business owner. Analyze this dataset and provide a complete analysis.

File: ${fileName}
Rows: ${rows.length}
Columns: ${JSON.stringify(columns)}
Numeric columns: ${numericCols.join(', ')}
Category columns: ${stringCols.join(', ')}
Date columns: ${dateCols.join(', ')}
Sample data (first ${sample.length} rows):
${JSON.stringify(sample, null, 2)}

Respond in this EXACT JSON format:
{
  "summary": "3-5 sentence executive summary in plain language. Start with the most important finding. Use concrete numbers. Write like you're telling a friend, not writing a report.",
  "keyMetrics": [
    {
      "title": "Metric name (e.g. 'Total Revenue')",
      "value": "Formatted value (e.g. '$64,800')",
      "trend": "up" | "down" | "neutral",
      "trendValue": "Change description (e.g. '+23% vs prior month')",
      "description": "One-line explanation"
    }
  ],
  "insights": [
    {
      "type": "trend" | "anomaly" | "recommendation" | "summary",
      "title": "Short headline",
      "content": "2-3 sentence explanation in everyday language",
      "confidence": 0.0-1.0
    }
  ],
  "recommendations": [
    {
      "title": "Action title (e.g. 'Focus on Electronics')",
      "description": "What to do and why, in plain language",
      "priority": "high" | "medium" | "low",
      "impact": "Expected impact (e.g. 'Could increase revenue by 15-20%')",
      "action": "Specific next step"
    }
  ],
  "charts": [
    {
      "type": "bar" | "line" | "pie",
      "xColumn": "column name from the data",
      "yColumn": "numeric column name from the data",
      "title": "Chart title"
    }
  ]
}

Rules:
- Provide 3-5 keyMetrics, 3-5 insights, 2-4 recommendations, 1-3 charts
- Use ONLY column names that exist in the data for chart xColumn/yColumn
- For charts, prefer: bar for categories, line for time series, pie for proportions
- Write everything in plain language — NO jargon like "column", "row", "dataset", "null"
- Use concrete numbers and comparisons
- For keyMetrics, calculate actual values from the sample data when possible
- Respond ONLY with the JSON object, no other text.`;

    const response = await callAI([{ role: 'user', content: prompt }], { maxTokens: 4096 });
    const parsed = parseAIJSON<AnalysisResult>(response.content);

    if (parsed && parsed.summary && Array.isArray(parsed.insights)) {
      // Validate chart columns exist
      parsed.charts = (parsed.charts || []).filter(c =>
        columns.some(col => col.name === c.xColumn) &&
        columns.some(col => col.name === c.yColumn)
      );
      return parsed;
    }

    // Fallback: wrap raw response as a simple analysis
    return {
      summary: response.content,
      keyMetrics: [],
      insights: [{
        type: 'summary' as const,
        title: 'Analysis Complete',
        content: response.content,
        confidence: 0.8,
      }],
      recommendations: [],
      charts: [],
    };
  },

  /**
   * Natural language query about data — returns a chart suggestion
   */
  async queryData(
    question: string,
    columns: Array<{ name: string; type: string }>,
    rows: Record<string, unknown>[],
  ): Promise<ChartSuggestion> {
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
    return parseAIJSON<ChartSuggestion>(response.content) ?? {
      chartType: 'table',
      xColumn: columns[0]?.name || 'x',
      yColumn: columns.find((c) => c.type === 'number')?.name || 'y',
      title: question,
      reasoning: 'Could not parse AI response, showing data as table.',
    };
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
    return parseAIJSON<ChartSuggestion>(response.content) ?? {
      chartType: 'bar',
      xColumn: columns[0]?.name || 'x',
      yColumn: columns.find((c) => c.type === 'number')?.name || 'y',
      title: 'Data Overview',
      reasoning: 'Default suggestion',
    };
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
